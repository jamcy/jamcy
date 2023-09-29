precision mediump float;

uniform vec2 resolution;
uniform float time;

const float PI = 3.141592653589793;

float stepping(float t) {
  return t < 0.0 ? -1. + pow(1. + t, 2.) : 1. - pow(1. - t, 2.);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / resolution.y;
  gl_FragColor = vec4(0);
  uv = normalize(uv) * length(uv);
  for (int i = 0; i < 12; i++) {
    float t = time + float(i) * PI / 12. * (5. + 1. * stepping(sin(time * 3.)));
    vec2 p = vec2(cos(t), sin(t));
    p *= cos(time + float(i) * PI * cos(time / 8.));
    vec3 col = cos(vec3(0, 1, -1) * PI * 2. / 3. + PI * (time / 2. + float(i) / 5.)) * 0.5 + 0.5;
    gl_FragColor += vec4(0.05 / length(uv - p * 0.9) * col, 1.0);
  }

  gl_FragColor.xyz = pow(gl_FragColor.xyz, vec3(3.));
  gl_FragColor.w = 1.0;
}
