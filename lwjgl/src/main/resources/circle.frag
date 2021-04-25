#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

//float plot(vec2 st, float pct){
//  return  smoothstep( pct-0.02, pct, st.y) -
//  smoothstep( pct, pct+0.02, st.y);
//}
//
//void main() {
//  vec2 st = gl_FragCoord.xy/u_resolution;
//
//  float y = st.x;
//
//  vec3 color = vec3(y);
//
//  // Plot a line
//  float pct = plot(st,y);
//  color = (1.0-pct)*color+pct*vec3(0.0,1.0,0.0);
//
//  gl_FragColor = vec4(color,1.0);
//}

float circle(in vec2 _st, in float _radius){
  vec2 dist = _st - vec2(0.5);
  return 1.0 - smoothstep(_radius - (_radius * 0.01), _radius+(_radius * 0.01), dot(dist, dist) * 4.0);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  gl_FragColor = vec4(vec3(circle(st, 0.5)), 1.0);
}

//void main() {
//  vec2 st = gl_FragCoord.xy / u_resolution;
//  gl_FragColor = vec4(st.x,st.y,0.0,1.0);
//  // gl_FragColor = vec4(abs(sin(u_time)), 0.0f, 0.0f, abs(sin(u_time)));
//}
