// precision mediump float; // only needed for mobile devices?


// // This uniform value is passed in using CSS.
// uniform vec3 saturation;


// void main()
// {
//     float r = css_ColorMatrix[0][0];
//     float g = css_ColorMatrix[1][1];
//     float b = css_ColorMatrix[2][2];

//     css_ColorMatrix[0][0] = saturation;
//     css_ColorMatrix[1][1] = saturation;
// }


precision mediump float; // only needed for mobile devices?

// This uniform value is passed in using CSS.
uniform vec3 saturation;


mat4 convertToDiagonalMatrix(vec3 v)
{
    return mat4(v[0],  0.0,  0.0, 0.0,
                0.0,  v[1],  0.0, 0.0,
                0.0,   0.0, v[2], 0.0,
                0.0,   0.0,  0.0, 1.0);
}

void main()
{
   css_ColorMatrix = convertToDiagonalMatrix(saturation);
}