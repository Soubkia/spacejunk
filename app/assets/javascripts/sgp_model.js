
// just some astrophysics. No big deal.


// formula source: http://celestrak.com/NORAD/documentation/spacetrk.pdf

// epoch_date used in these calculations is since 1950.
// epoch used in generating gmst is base julian time. (I believe)

sgpPositionVectors = function(sat) {

    var t0, n0, e0, M0, w0, om0, i0, nd0, ndd0, j2, j2c, j3c, j4,
        E6, t, ke, a1, d1, a0, p0, q0, L0, dOm, dw, aA, eE, pP,
        omS0, wS0, LS, aXnsl, aYnsl, lL, UU, eWm, ecosE, esinE,
        eL2, pL, rR, rdR, rvdV, sinuU, cosuU, uU, rRk, uUk, omk,
        ik, Mx, My, Mz, Nx, Ny, Nz, Ux, Uy, Uz, Vx, Vy, Vz;


    t0 = sat.epoch_date + (50*365.25);             // need to make epoch the gmst from 1950, not 2000 (add 50*365.25)
    n0 = sat.mean_motion;
    e0 = sat.eccentricity;
    M0 = degToRad(sat.mean_anomoly);
    w0 = degToRad(sat.perigee);
    om0 = degToRad(sat.right_asc);
    i0 = degToRad(sat.inclination);
    nd0 = sat.first_derivative;
    ndd0 = sat.second_derivative;
    j2 = (5.41308*Math.pow(10, -4));               // formula replacement, not actual j2 harmonic
    j2c = (1.0826269*Math.pow(10,-3));             // constant value of j2
    j3c = (-2.53881*Math.pow(10, -6));             // actual j3 harmonic, not a formula replacement
    j4 = (0.62098875*Math.pow(10, -6));            // formula replacement, not actual j4, but close enough to j4 for gov't work
    E6 = Math.pow(10, -6);
    t = t0 + 360;                                  // temporarily fake julian date change



    ke = Math.sqrt(398600.4418);
    a1 = Math.pow((ke/n0), 2/3);
    d1 = ((3/2)*(j2/Math.pow(a1, 2)*((3*Math.pow(Math.cos(t0), 2) - 1)/Math.pow(1-Math.pow(e0, 2), 3/2))));
    a0 = a1 * (1 - (1/3*d1) - Math.pow(d1, 2) - (134/81*Math.pow(d1, 3)));
    p0 = a0 * (1 - Math.pow(e0, 2));
    q0 = a0 * (1-e0);
    L0 = M0 + w0 + om0;
    dOm = (-3 * j2 * n0 * Math.cos(i0) / Math.pow(p0, 2));
    dw = (3/2 * j2 * n0 * ((5 * Math.pow(Math.cos(i0), 2)) - 1) / Math.pow(p0, 2));
    aA = a0 * Math.pow((n0 / (n0 + (nd0 *(t - t0)) + (ndd0 / 2 * Math.pow((t- t0), 2)))), 2/3);

    if (aA > q0) {
        eE = (1 - (q0/aA));
    } else {
        eE = Math.pow(10, -6);
    };

    pP = aA * (1 - Math.pow(eE, 2));
    omS0 = om0 + (dOm * (t - t0));
    wS0 = w0 + (dw * (t = t0));
    LS = L0  + ((n0 + dw + dOm) * (t - t0)) + (nd0 / 2 * Math.pow((t-t0), 2)) + (ndd0 / 6 * Math.pow((t-t0), 3));
    aYnsl = ((eE * Math.sin(w0)) - ((j3c*Math.sin(i0))/(2 * j2c * pP)));
    aXnsl = eE * Math.cos(wS0);
    lL = ( LS-((j3c*Math.sin(i0)*aXnsl / (4*j2c*pP) * (( 3+5*Math.cos(i0)) / (1+Math.cos(i0))) )) );
    UU = lL - omS0;
    eW = UU;
    ecosE = (aXnsl*Math.cos(eW)) + (aYnsl*Math.sin(eW));
    esinE = (aXnsl*Math.sin(eW)) - (aYnsl*Math.cos(eW));
    eL2 = Math.pow(aXnsl, 2) + Math.pow(aYnsl, 2);
    pL = aA * (1 - eL2);
    rR = aA * (1 - ecosE);
    rdR = ke * Math.sqrt(aA) * esinE / rR;
    rvdV = ke * Math.sqrt(pL) /rR;
    sinuU = (aA/rR) * ( Math.sin(eW) - aYnsl - ( aXnsl * esinE / (1 + Math.sqrt(1 - eL2)) ) );
    cosuU = (aA/rR) * ( Math.cos(eW) - aXnsl + ( aYnsl * esinE / (1 + Math.sqrt(1 - eL2)) ) );
    uU = Math.atan(sinuU / cosuU);
    rRk = rR + ((j2 * Math.pow(Math.sin(i0), 2) * Math.cos(2 * uU)) / (2 * pL ));
    uUk = uU - ((j2 * (7 * Math.pow(Math.sin(i0), 2) - 1) * Math.sin(2 * uU)) / (4 * Math.pow(pL, 2)));
    omk = omS0 + ((3 * j2 * Math.cos(i0) * Math.sin(2 * uU)) / ( 2 * Math.pow(pL, 2) ));
    ik = i0 + ((3 * j2 * Math.cos(i0) * Math.sin(i0) * Math.cos(2 * uU)) / ( 2 * Math.pow(pL, 2) ));

    // positions and vectors
    Mx = -(Math.sin(omk)*Math.cos(ik));
    My = Math.cos(omk)*Math.cos(ik);
    Mz = Math.sin(ik);

    Nx = Math.cos(omk);
    Ny = Math.sin(omk);
    Nz = 0;

    // Geocentric cartesian coordinates
    Ux = (Mx * Math.sin(uUk)) + (Nx * Math.cos(uUk));
    Uy = (My * Math.sin(uUk)) + (Ny * Math.cos(uUk));
    Uz = (Mz * Math.sin(uUk)) + (Nz * Math.cos(uUk));
    // vectors
    Vx = (Mx * Math.cos(uUk)) - (Nx * Math.sin(uUk));
    Vy = (My * Math.cos(uUk)) - (Ny * Math.sin(uUk));
    Vz = (Mz * Math.cos(uUk)) - (Nz * Math.sin(uUk));

    var satellite = {};

    satellite.posX = rRk * Ux;
    satellite.posY = rRk * Uy;
    satellite.posZ = rRk * Uz;

    satellite.vecX = (rdR * Ux) + (rvdV * Vx);
    satellite.vecY = (rdR * Uy) + (rvdV * Vy);
    satellite.vecZ = (rdR * Uz) + (rvdV * Vz);

    return [sat, satellite];
}


// GREENWICH MEAN SIDERIAL TIME

// t0 = sat.epoch_date/36525
// t01 =
// t02 =
// gmst = 100.46061837 + (36000.770053608 * t0) + (0.000387933 * (t0 * t0)) - ((t0*t0*t0) / 38710000)
