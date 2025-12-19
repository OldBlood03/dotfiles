#version 300 es

precision mediump float;
in vec2 v_texcoord;
layout(location = 0) out vec4 fragColor;
uniform sampler2D tex;
uniform float time;
uniform vec2 screenSize;

vec3 ApplyKernel(vec2 uv, vec3[9] kernel){

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
    return accumulatedColor;
}

vec3 gaussian_33 (vec2 uv){
    const vec3 gaussian_kernel[9] = vec3[9](
            vec3(0.0625), vec3(0.125), vec3(0.0625), 
            vec3(0.125), vec3(0.25), vec3(0.125), 
            vec3(0.0625), vec3(0.125), vec3(0.0625)
    );


    return ApplyKernel(uv, gaussian_kernel);
}

vec3 vertical_edge_detection (vec2 uv){
    const vec3 edge_detection_kernel[9] = vec3[9](
            vec3(-0.33), vec3(0.0), vec3(0.33), 
            vec3(-0.33), vec3(0.0), vec3(0.33), 
            vec3(-0.33), vec3(0.0), vec3(0.33)
    );

    return ApplyKernel (uv, edge_detection_kernel);
}

vec3 horizontal_edge_detection (vec2 uv){
    const vec3 edge_detection_kernel[9] = vec3[9](
            vec3(-0.33), vec3(-0.33), vec3(-0.33), 
            vec3(0), vec3(0.0), vec3(0), 
            vec3(0.33), vec3(0.33), vec3(0.33)
    );

    return ApplyKernel (uv, edge_detection_kernel);
}

void main() {
    vec4 color = texture (tex, v_texcoord);
    //color.rgb = vertical_edge_detection(v_texcoord);
    //color.rgb = horizontal_edge_detection(v_texcoord);
    //color.rgb = gaussian_33(v_texcoord);
    fragColor = color;
}
