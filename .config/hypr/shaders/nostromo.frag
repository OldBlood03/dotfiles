#version 300 es

precision mediump float;
in vec2 v_texcoord;
layout(location = 0) out vec4 fragColor;
uniform sampler2D tex;
uniform float time;
uniform vec2 screenSize;

vec3 hash33(vec3 p) {
    p = vec3( dot(p, vec3(127.1, 311.7, 74.7)),
              dot(p, vec3(269.5, 183.3, 246.1)),
              dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float gnoise(vec3 x) {
    vec3 p = floor(x);
    vec3 w = fract(x);
    vec3 u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);
    
    vec3 ga = hash33(p + vec3(0.0, 0.0, 0.0));
    vec3 gb = hash33(p + vec3(1.0, 0.0, 0.0));
    vec3 gc = hash33(p + vec3(0.0, 1.0, 0.0));
    vec3 gd = hash33(p + vec3(1.0, 1.0, 0.0));
    vec3 ge = hash33(p + vec3(0.0, 0.0, 1.0));
    vec3 gf = hash33(p + vec3(1.0, 0.0, 1.0));
    vec3 gg = hash33(p + vec3(0.0, 1.0, 1.0));
    vec3 gh = hash33(p + vec3(1.0, 1.0, 1.0));
    
    float va = dot(ga, w - vec3(0.0, 0.0, 0.0));
    float vb = dot(gb, w - vec3(1.0, 0.0, 0.0));
    float vc = dot(gc, w - vec3(0.0, 1.0, 0.0));
    float vd = dot(gd, w - vec3(1.0, 1.0, 0.0));
    float ve = dot(ge, w - vec3(0.0, 0.0, 1.0));
    float vf = dot(gf, w - vec3(1.0, 0.0, 1.0));
    float vg = dot(gg, w - vec3(0.0, 1.0, 1.0));
    float vh = dot(gh, w - vec3(1.0, 1.0, 1.0));
    
    float gNoise = va + u.x * (vb - va) + 
            u.y * (vc - va) + 
            u.z * (ve - va) + 
            u.x * u.y * (va - vb - vc + vd) + 
            u.y * u.z * (va - vc - ve + vg) + 
            u.z * u.x * (va - vb - ve + vf) + 
            u.x * u.y * u.z * (-va + vb + vc - vd + ve - vf - vg + vh);
    return 2.0 * gNoise;
}

void ApplyKernel(inout vec3 color, vec2 uv, vec3[9] kernel){
    vec2 pixel_to_uv = 1.0 / screenSize;
    vec3 accumulatedColor = vec3(0.0);
    int centerIndex = 4;

    for (int i = -1; i <= 1; i++){
        for (int j = -1; j <= 1; j++){
            if ((float(i)*pixel_to_uv.y + uv.y <= 1.0) && (float(j)*pixel_to_uv.x + uv.x <= 1.0) && (float(i)*pixel_to_uv.y + uv.y >= 0.0) && (float(j)*pixel_to_uv.x + uv.x >= 0.0)) {
                vec3 pointColor = texture( tex, vec2( float(j)*pixel_to_uv.x + uv.x, float(i)*pixel_to_uv.y + uv.y ) ).rgb;
                accumulatedColor += kernel[centerIndex + i*3 + j]*pointColor; 
            }
        }
    }
    color = accumulatedColor;
}

//pos [0,1] 
float SquareWave(float x, float pos, float width){ 
    if ( (fract(fract(pos) + fract(width)) < fract(pos)) && x < fract(pos) && x > fract(fract(fract(pos) + fract(width))) ){
        return 0.0;
    } else if ( x < fract(pos) || x > fract(fract(pos) + fract(width)) ){
        return 0.0;
    }
    return 1.0;
}

float SawtoothWave(float x, float frequency){
    return x*frequency - abs(x)*frequency;
}

vec2 CRTCurveUV( vec2 uv ){
    uv = uv * 2.0 - 1.0;
    vec2 offset = abs( uv.yx ) / vec2( 6.0, 5.0 );
    uv = uv + uv * offset * offset;
    uv = uv * 0.5 + 0.5;
    return uv;
}


vec2 CRTWaveActual ( vec2 uv ){
    const float intensity = 0.01;
    const float period = 10.0;
    float distortion = smoothstep(0.999, 1.0, pow(sin((uv.y + time * (1.0 + (1.0/period))) * 1.0/period), period*3.0)) * intensity;
    distortion -= smoothstep(0.999, 1.0, pow(sin((uv.y + time) * 1.0/period), period*3.0)) * intensity;
    uv.x += distortion;
    return uv;
}

vec2 CRTWaveSmooth ( vec2 uv ){
    const float width = 0.05;
    const float frequency = 0.01;
    float pos = time*frequency;
    float offset = abs( SquareWave(uv.y, pos, width)*sin(uv.y*10.0) ) / 5.0;
    uv.y += uv.y * offset * offset;

    return uv;
}

void CRTVignette( inout vec3 color, vec2 uv, float intensity ){    
    float vignette = uv.x * uv.y * ( 1.0 - uv.x ) * ( 1.0 - uv.y );
    vignette = clamp( 1.0/intensity * pow(vignette, 0.3 ), 0.0, 1.0 );
    color *= vignette;
}


void CRTScanline( inout vec3 color, vec2 uv ){
    float scanline 	= clamp( 10.0 + 0.05 * cos( 3.14 * ( uv.y + 0.008 * time ) * 240.0 * 1.0 ), 0.0, 1.0 );
    float grille 	= 0.85 + 0.15 * clamp( 1.5 * cos( 3.14 * uv.x * 640.0 * 1.0 ), 0.0, 1.0 );    
    color *= scanline * grille * 1.2;
}


void CRTChromaticAberrationKernel(inout vec3 color, vec2 uv){
    const vec3 chromaticAberrationKernel[9] = vec3[9](
            vec3(0.0000000000000000000, 0.04416589065853191, 0.0922903086524308425), vec3(0.10497808951021347), vec3(0.0922903086524308425, 0.04416589065853191, 0.0000000000000000000),
            vec3(0.0112445223775533675, 0.10497808951021347, 0.1987116566428735725), vec3(0.40342407932501833), vec3(0.1987116566428735725, 0.10497808951021347, 0.0112445223775533675),
            vec3(0.0000000000000000000, 0.04416589065853191, 0.0922903086524308425), vec3(0.10497808951021347), vec3(0.0922903086524308425, 0.04416589065853191, 0.0000000000000000000)
            );  
 
    ApplyKernel(color, uv, chromaticAberrationKernel);
}

vec2 CRTWiggle ( vec2 uv ){
    const float intensity = 0.0001;
    vec2 pixel_to_uv = 1.0 / screenSize;
    float distortion = gnoise(vec3(0.0, uv.y*pixel_to_uv.y * 0.01, time * 500.0)) * (intensity * 4.0);
    uv.x += distortion;
    return uv;
}

int rstate = 12345;
float Rand(){
    int m = 65537;
    int a = 75;
    rstate = a*rstate*int(time) % m;
    //apparently cannot cast in glsl
    float numer = float(rstate);
    float denom = float(m);
    return numer/denom;
}


void CRTStatic(inout vec3 color, vec2 uv, vec3 intensity, float frequency){
    color.r += fract(sin(dot(uv, vec2(12.9898, 78.233))) * sin(time*frequency*Rand()) * 4750.5453) * intensity.x;
    color.g += fract(sin(dot(uv, vec2(12.9898, 78.233))) * sin(time*frequency*Rand()) * 4350.5453) * intensity.y;
    color.b += fract(sin(dot(uv, vec2(12.9898, 78.233))) * sin(time*frequency*Rand()) * 4370.5453) * intensity.z;
}


vec3 CRTGlow (vec2 uv){
    const vec3 chromaticAberrationKernel[9] = vec3[9](
            vec3(0.0000000000000000000, 0.04416589065853191, 0.0922903086524308425), vec3(0.10497808951021347), vec3(0.0922903086524308425, 0.04416589065853191, 0.0000000000000000000),
            vec3(0.0112445223775533675, 0.10497808951021347, 0.1987116566428735725), vec3(0.40342407932501833), vec3(0.1987116566428735725, 0.10497808951021347, 0.0112445223775533675),
            vec3(0.0000000000000000000, 0.04416589065853191, 0.0922903086524308425), vec3(0.10497808951021347), vec3(0.0922903086524308425, 0.04416589065853191, 0.0000000000000000000)
            );  
    const vec3 gaussian_kernel[9] = vec3[9](
            vec3(0.0625), vec3(0.125), vec3(0.0625), 
            vec3(0.125), vec3(0.25), vec3(0.125), 
            vec3(0.0625), vec3(0.125), vec3(0.0625)
    );

    vec2 pixel_to_uv = 1.0 / screenSize;
    vec3 accumulatedColor = vec3(0.0);
    int centerIndex = 4;

    for (int i = -1; i <= 1; i++){
        for (int j = -1; j <= 1; j++){
            if ((float(i)*pixel_to_uv.y + uv.y <= 1.0) && (float(j)*pixel_to_uv.x + uv.x <= 1.0) && (float(i)*pixel_to_uv.y + uv.y >= 0.0) && (float(j)*pixel_to_uv.x + uv.x >= 0.0)) {
                vec3 pointColor = texture( tex, vec2( float(j)*pixel_to_uv.x + uv.x, float(i)*pixel_to_uv.y + uv.y ) ).rgb;
                accumulatedColor += chromaticAberrationKernel[centerIndex + i*3 + j]*pointColor; 
                accumulatedColor += gaussian_kernel[centerIndex + i*3 + j]*pointColor; 
            }
        }
    }
    return accumulatedColor*0.5;
}

void main() {
    vec2 uv = v_texcoord.xy;
    uv = CRTCurveUV( uv );
    uv = CRTWiggle( uv );
    //uv = CRTWaveActual( uv );

    vec4 color  = texture( tex, uv );
    CRTChromaticAberrationKernel(color.xyz, uv);
    color.rgb -= 0.05;
    //color.rgb = CRTGlow( uv );

    CRTVignette( color.xyz, uv, 0.1 );
    CRTScanline( color.xyz, uv );
    CRTStatic  ( color.xyz, uv, vec3(0.1, 0.11, 0.09), 5.0 );

    fragColor.xyz = color.xyz;
}
