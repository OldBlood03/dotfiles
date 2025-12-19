#version 300 es

precision mediump float;
in vec2 v_texcoord;
layout(location = 0) out vec4 fragColor;
uniform sampler2D tex;
uniform float time;
uniform vec2 screenSize;

void main() {
    vec4 color = texture (tex, v_texcoord);
    fragColor = color;
}
