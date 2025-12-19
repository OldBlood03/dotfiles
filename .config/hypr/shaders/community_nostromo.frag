#version 300 es

precision mediump float;
in vec2 v_texcoord;
layout(location = 0) out vec4 fragColor;

uniform sampler2D tex;
uniform float time;
uniform vec2 screenSize;

// --- Compatibility & Noise Generation ---

#define iResolution screenSize
#define iTime time
#define R screenSize

// 1. Hash function to replace iChannel0/iChannel1 (Noise Textures)
// This generates random static without needing an external image
vec4 hash42(vec2 p) {
    vec4 p4 = fract(vec4(p.xyxy) * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy+33.33);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}

// 2. Texture helper (Simulating the 'Tn' function from the original)
// Ignores 'lod' because screen textures usually don't have mipmaps
vec4 Tn(vec2 uv, float lod) {
    return texture(tex, uv); 
}

// 3. Re-implementation of noise functions using our Hash instead of textures
vec4 noise(float t){
    return hash42(vec2(floor(t), floor(t)));
}

vec4 valueNoise(vec2 t, float w){
    vec2 fr = fract(t);
    // Replaced texture lookups with hash42 calls
    return mix(
            mix( 
                hash42(vec2(floor(t.x), floor(t.y))),
                hash42(vec2(floor(t.x), floor(t.y) + 1.)),
                smoothstep(0.,1.,fr.y)
            ),
            mix( 
                hash42(vec2(floor(t.x) + 1.,floor(t.y))),
                hash42(vec2(floor(t.x) + 1.,floor(t.y) + 1.)),
                smoothstep(0.,1.,fr.y)
            ),
            smoothstep(0.,1.,pow(fr.x, w)));
}

vec4 fbm(vec2 uv){
    vec4 n = vec4(0);
    n += valueNoise(uv*800.,0.1);
    n += valueNoise(uv*1700.,0.1)*0.5;
    n -= valueNoise(uv*10.,1.)*1.;
    n -= valueNoise(uv*20.,0.5)*0.5;
    n = smoothstep(0.,1.,n);
    return n;
}

float eass(float p, float g) {
    float s = p*0.45;
    for(float i = 0.; i < g; i++){
        s = smoothstep(0.,1.,s);
    }
    return s;
}

// --- Main Logic ---

void main() {
    // 1. Setup coordinates
    // v_texcoord is already 0.0-1.0, so it is our 'uv'
    vec2 uv = v_texcoord;
    
    // Calculate fragCoord for logic that depends on pixel units
    vec2 fragCoord = v_texcoord * screenSize;
    
    // Calculate centered UVs (nuv)
    vec2 nuv = (fragCoord - 0.5*iResolution.xy)/iResolution.y;
    
    vec2 offs = vec2(cos(iTime*0.5),sin(iTime*0.9))*0.04;
    uv += offs;
    nuv += offs;
    vec2 bentuv = nuv * (1. - smoothstep(1.,0.,dot(nuv,nuv)*0.2)*0.4);
    
    bentuv *= 1.7;
    
    // 2. Glitch Logic
    float df = dFdx(uv.x);
    float amt = (dot(nuv,nuv) + 0.1)*2.*(1.04-eass((iTime)/3.,3.));
    
    float env = eass(iTime*1.,3.);
    float envb = eass((iTime - 2.)*0.4,2.);
    float envc = eass((iTime - 4.)*1.,2.);
    float envd = eass((iTime - 9.)*1.,2.);
    
    vec4 nA = fbm(uv*0.02 + iTime*(20.));
    vec4 nB = fbm(vec2(1. + iTime*0.3 + sin(iTime)*0.1,uv.y*0.42));
    vec4 nC = valueNoise(vec2( iTime,uv.y),0.5);
    vec4 nD = valueNoise(vec2( iTime*50.,uv.y),0.5);
    vec4 nE = fbm(vec2(uv.x*0.02,iTime));
    vec4 nF = fbm(vec2(uv.x*1.0,mod(iTime*200.,2000.)));
    vec4 nG = fbm(vec2(uv.x,uv.y + mod(iTime,2000.)));
    vec4 nT = valueNoise(vec2( iTime),0.5);
    
    float glitch = 0.;
    glitch += pow(nB.x,0.5)*0.005 + nB.y*0.005;
    glitch *= 1.;
    uv.x += glitch*0.1;
    
    float slidey = smoothstep(0.01,0.,abs(uv.y - nC.x*1.4) - 0.1 + nE.x*0.06);
    
    slidey *= smoothstep(0.,df*(224.2 ),abs(nuv.x + R.x/R.y*0.5 - 0.01) - 0.004);
    
    glitch += slidey*0.002;
    uv.x += slidey*(pow(nC.y,0.01)*0.004 + 0.001);
    
    uv.x += 0.1*pow(nB.x,2.)*smoothstep(df*(4.2 ),0.,(abs(nuv.x + R.x/R.y*0.5 - 0.01) - 0.004 )*0.2);
    
    uv.x += pow(nB.x,2.)*0.007;
    
    // Initialize Output Color
    vec4 C = vec4(0);

    C += smoothstep(df*(1. + nE.y*2.2),0.,abs(uv.y  + nC.x*.02 + 0.1 - 2.*nD.y*float(nC.z>0.4)) + nE.x*0.04 - (nE.y*0.01))*(0.5*nE.y );
    
    if(nA.x*nA.z > 0.1 - 0.0009*sin(iTime) ){
        glitch += 0.01;
        uv += 0.02;
    }
    if(nB.x*nB.y > 0.1 - envc*0.10001){
        // Optional stronger glitch logic
    }
    
    float mip = 0.5 + nG.x*5.;
    
    float iters = 20.;
    
    vec3 chrab = vec3(0);
    vec2 chruv = uv;
    vec2 dir = vec2(1.,0.);
    amt *= 1.;
    amt += glitch*224.4;
    
    // Chromatic Aberration Loop
    for(float i = 0.; i < iters; i++){
        float slider = i/iters;
        chrab.r += Tn(uv + amt*dir*0.004*slider,mip).r;
        chrab.g += Tn(uv + -amt*dir*0.01*slider,mip).g;
        chrab.b += Tn(uv + amt*dir*0.01*slider,mip).b;
    }
    
    chrab /= iters;
    vec3 bloom = vec3(0);
      for( float x = -1.0; x < 2.5; x += 1.0 ){
        bloom += vec3(
          Tn( uv + vec2( x - 0.0, 0.0 ) * 7E-3, mip).x,
          Tn( uv + vec2( x - 1.0 + sin(iTime), 0.0 ) * 7E-3,mip ).y,
          Tn( uv + vec2( x - 4.0 - sin(iTime*4.), 0.0 ) * 7E-3, mip ).z
        );
      }
    bloom/=iters;
    
    C.rgb += mix(chrab,bloom,0.5);
    
    C = mix(C,vec4(1),(smoothstep(0.5,0.41,pow(nT.x,0.9)) + 0.02)*pow(smoothstep(0.6,0.,valueNoise( uv*190. + vec2(0,nA.x*30. + pow(nB.y, 0.01)*70.*nT.y) + mod(iTime*2000.,20000.),1. + 3.*nC.x).x),18. - nT.w*uv.y*17.));
    
    C.rgb = mix(vec3(1),C.rgb,1.);
    
    vec2 bentuvold = bentuv;
    
    float dfbentuv = dFdx(bentuv.x);
    
    bentuv = abs(bentuv);
    float dedges = abs(bentuv.x) - 0.9;
    dedges = max(dedges, bentuv.y - 0.5);
    float edger = 0.1;
    
    C *= pow(smoothstep(0.1,0., bentuv.x - R.x/R.y*0.47),1.);
    C *= pow(smoothstep(0.1,0., bentuv.y - R.y/R.y*0.4),1.);
    
    C = mix(C, Tn(uv + 0.2,2.)*0.01,1.-smoothstep(dfbentuv*4.,0.,dedges));
    
    C *= smoothstep(1.,0.2, 0.3 + 0.2*uv.y*(0.7 + nD.x));
    C *= pow(smoothstep(1.,0., dot(nuv*0.6,nuv)),1.);
    
    bentuvold -= vec2(0.3,0.1);
    
    C += pow(smoothstep(1.,0., length(bentuvold) - 0.),4.)*0.01*vec4(0.6,0.9,0.9,0.);
    
    // Gamma correction
    C = pow(C,vec4(0.4545));
    
    fragColor = C;
}
