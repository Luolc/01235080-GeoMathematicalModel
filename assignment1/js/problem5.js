'use strict';

const samples = [
    {number: 1, x: 1.9, y: 1.2},
    {number: 2, x: 2.0, y: 1.5},
    {number: 3, x: 2.1, y: 1.8},
    {number: 4, x: 2.4, y: 2.4},
    {number: 5, x: 2.7, y: 2.8},
    {number: 6, x: 3.0, y: 2.9},
    {number: 7, x: 3.5, y: 3.0},
    {number: 8, x: 3.5, y: 2.7},
    {number: 9, x: 4.5, y: 4.2},
    {number: 10, x: 3.8, y: 3.5},
    {number: 11, x: 4.5, y: 3.8},
    {number: 12, x: 5.7, y: 4.5},
    {number: 13, x: 5.5, y: 5.4},
    {number: 14, x: 5.2, y: 5.2},
    {number: 15, x: 6.2, y: 5.5},
    {number: 16, x: 6.8, y: 6.4},
    {number: 17, x: 6.5, y: 6.0},
    {number: 18, x: 7.1, y: 5.8},
    {number: 19, x: 8.2, y: 6.6},
    {number: 20, x: 7.8, y: 7.9},
    {number: 21, x: 8.9, y: 8.5},
    {number: 22, x: 9.0, y: 8.0},
    {number: 23, x: 9.5, y: 8.1},
    {number: 24, x: 10.0, y: 8.2},
    {number: 25, x: 10.1, y: 8.9},
    {number: 26, x: 11.0, y: 8.8},];

function sum(nums) {
    return nums.reduce(function (a, b) {
        return a + b;
    });
}

const page = new Vue({
    el: '#main',
    data: {
        samples: samples,
        r: 0,
        a0: 0,
        a1: 0,
        U: 0,
        Q: 0,
        F: 0,
        SqSquare: 0,
        SAll: 0,
    },
    methods: {
        init: function () {
            const sumX = sum(samples.map(function (s) { return s.x; }));
            const sumY = sum(samples.map(function (s) { return s.y; }));
            const sumXSquare = sum(samples.map(function (s) { return s.x * s.x; }));
            const sumYSquare = sum(samples.map(function (s) { return s.y * s.y; }));
            const sumXY = sum(samples.map(function (s) { return s.x * s.y; }));

            const lxx = sumXSquare - sumX * sumX / samples.length;
            const lyy = sumYSquare - sumY * sumY / samples.length;
            const lxy = sumXY - sumX * sumY / samples.length;

            this.r = lxy / Math.sqrt(lxx * lyy);

            const avgX = sumX / samples.length;
            const avgY = sumY / samples.length;
            this.a1 = lxy / lxx;
            this.a0 = avgY - this.a1 * avgX;

            this.U = this.a1 * lxy;
            this.Q = lyy - this.a1 * lxy;
            this.SAll = lyy;
            this.SqSquare = this.Q / (samples.length - 2);
            this.F = this.U / this.SqSquare;

            const canvas = this.$refs.canvas;
            const func = function (x) {
                return page.a0 + page.a1 * x;
            };
            const plt = new Plot(canvas);
            plt.xlabel("x");
            plt.ylabel("y");
            plt.xlim(0, 12);
            plt.ylim(0, 10);
            plt.xticks([0, 2, 4, 6, 8, 10, 12]);
            plt.yticks([0, 2, 4, 6, 8, 10]);
            plt.scatter(
                samples.map(function (s) { return s.x; }),
                samples.map(function (s) { return s.y; }));
            plt.plot([1., 11.], [func(1.), func(11.)]);
            plt.show();
        },
    },
});

page.init();

const pageNumber = 5;
