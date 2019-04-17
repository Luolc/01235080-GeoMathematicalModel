'use strict';

const speeds = [1.11, 1.1, 1.07, 1.12, 1.11, 1.19];

const years = [1999, 2000, 2001, 2002, 2003, 2004];

function geometricMean(nums) {
    const product = nums.reduce(function (a, b) {
        return a * b;
    });
    return Math.pow(product, 1.0 / nums.length);
}

const page = new Vue({
    el: '#main',
    data: {
        speeds: speeds,
        years: years,
        geometricMean: geometricMean(speeds),
    },
});

const pageNumber = 2;
