
/*{ "osc": 6000 }*/
precision mediump float;
varying vec3 mPos;

uniform vec2 resolution;
// uniform vec2 mouse;
uniform float time;
uniform sampler2D osc_sample1;
uniform sampler2D osc_sample2;

const float PI = 3.14159265;
const float angle = 45.0;
const float fov = angle * 0.5 * PI / 360.0;
vec3  cPos = vec3(0.0, 0.0, 2.0);

const vec3 lightDir = vec3(-0.77, 0.177, 0.577);

vec3 trans(vec3 p) {
  return mod(p, 2.0) * 1.29 - 2.2;
}

vec2 random2( vec2 p ) {
  return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(1269.5,183.3))))*43758.5453);
}

float normDistanceFunc(vec3 p) {
  vec3 q = abs(trans(p));
    return length(max(q - vec3(0.9), 0.0));
}

float distanceFunc(vec3 p, vec3 mod1, vec3 mod2) {
  vec3 q = abs(trans(p));
  vec2 st = - gl_FragCoord.xy / resolution.xy;
  st.x += resolution.x / resolution.y;

  float m_dist = 1.0;
    //scale
  st *= 1.0 - mod1.x * 3.0;

  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  float dist = 1.0;  // minimun distance

  for (int y= -1; y <= 1; y++) {
    for (int x= -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = random2(i_st + neighbor);
      point = 0.000005 + 0.19 * sin(time * 1.9 + 1024.5 * point) + mod1.xy * 0.5;
      vec2 diff = q.xy + neighbor - point - f_st;
      float dist = length(diff);
      m_dist = min(m_dist, dist);
    }
  }
  return length(min(q - vec3(m_dist), mod2.x * 0.53)) - clamp(m_dist, 0.01, 12.02);
}

vec3 getNormal(vec3 p) {
  float d = 0.01;
  return normalize(vec3(
    normDistanceFunc(p + vec3(  d, 0.0, 0.0)) - normDistanceFunc(p + vec3( -d, 0.0, 0.0)),
    normDistanceFunc(p + vec3(0.0,   d, 0.0)) - normDistanceFunc(p + vec3(0.0,  -d, 0.0)),
    normDistanceFunc(p + vec3(0.0, 0.0,   d)) - normDistanceFunc(p + vec3(0.0, 0.0,  -d))
  ));
}

void main(void){
  vec2 uv = gl_FragCoord.xy / resolution;
  vec4 tex_osc = texture2D(osc_sample1, uv);
  vec4 tex_osc2 = texture2D(osc_sample2, uv);
  // fragment position
  vec2 p = (gl_FragCoord.xy * 3.0 - resolution) / min(resolution.x, resolution.y);

  // camera
  vec3 cPos = vec3(vec2(0.09, 0.2) * 24.2,  0.9 * time) * vec3(vec2(tex_osc.x - 0.8), 0.0);

  vec3 cDir = vec3(0.9,  -0.10, -1.0);
  vec3 cUp  = vec3(0.0,  1.0,  0.0);
  vec3 cSide = cross(cDir, cUp);
  float targetDepth = 1.0;

  // ray
  vec3 ray = normalize(vec3(sin(fov) * p.x, sin(fov) * p.y, -cos(fov)));

  // marching loop
  float distance = 0.0;
  float rLen = 0.05 + tex_osc.x * 2.0;
  vec3  rPos = cPos ;
  for(int i = 0; i < 16; i++){
    distance = distanceFunc(rPos, vec3(tex_osc), vec3(tex_osc2));
    rLen += distance;
    rLen -= distance * 0.5;
    rPos = cPos + ray * rLen;
  }

  vec3 normal = getNormal(rPos);
  float diff = clamp(dot(lightDir, normal), 0.9, 1.0);
  float grad_fact = min(diff, abs(distance));
  gl_FragColor = vec4(vec3(1.2 * grad_fact + 0.015), 1.0);
}
