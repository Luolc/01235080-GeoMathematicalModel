'use strict';

const temperatures = [-6.8, -2.7, -5.9, -3.4, -4.7, -3.8, -5.3, -5.0, -4.3,
    -5.7, -3.6, -3.1, -3.9, -3.0, -4.9, -5.7, -4.8, -5.6, -6.4, -5.6];

const years = [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999,
    2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010];

function sum(nums) {
    return nums.reduce(function (a, b) {
        return a + b;
    });
}

function mean(nums) {
    return sum(nums) / nums.length;
}

function variance(nums) {
    const avg = mean(nums);
    const squares = nums.map(function (i) {
        return (i - avg) * (i - avg);
    });
    return sum(squares) / (nums.length - 1);
}

function coefficientOfVariance(nums) {
    return Math.sqrt(variance(nums)) / mean(nums);
}

const page = new Vue({
    el: '#main',
    data: {
        temperatures: temperatures,
        years: years,
        mean: mean(temperatures),
        variance: variance(temperatures),
        coefficientOfVariance: coefficientOfVariance(temperatures),
    },
    methods: {
        init: function () {
            const canvas1 = this.$refs.canvas1;
            const plt1 = new Plot(canvas1);
            plt1.xlabel("温度(℃)");
            plt1.ylabel("频数");
            plt1.ylabelOpposite("频率(%)");
            plt1.hist(temperatures, false, 'rgba(0, 150, 255, 0.3)');
            plt1.ticksParams.xFixed = 2;
            plt1.show();

            const canvas2 = this.$refs.canvas2;
            const plt2 = new Plot(canvas2);
            plt2.xlabel("温度(℃)");
            plt2.ylabel("累积频数");
            plt2.ylabelOpposite("累积频率(%)");
            plt2.hist(temperatures, true, 'rgba(0, 150, 255, 0.3)');
            plt2.ticksParams.xFixed = 2;
            plt2.show();
        },
    },
});

page.init();

const pageNumber = 1;
