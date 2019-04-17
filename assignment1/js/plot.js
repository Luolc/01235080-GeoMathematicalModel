'use strict';

function fillRotatedText(ctx, text, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(text, 0, 0);
    ctx.restore();
}

function fillVerticalText(ctx, text, x, y) {
    fillRotatedText(ctx, text, x, y, -0.5 * Math.PI);
}

function setFontSize(ctx, fontSize) {
    ctx.font = fontSize.toString() + 'px Arial';
}

const Plot = function (canvas) {
    const self = this;

    // canvas
    this.canvas = canvas;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    this.width = canvas.offsetWidth;
    this.height = canvas.offsetHeight;
    this.ctx = canvas.getContext('2d');

    // border
    this.top = 0;
    this.bottom = 0;
    this.left = 0;
    this.right = 0;

    this.pltFunctions = [];

    this.labelParams = {
        fontSize: 12,
        xlabel: null,
        ylabel: null,
        xlabelOpposite: null,
        ylabelOpposite: null,
    };

    this.limParams = {
        xlim: [0., 0.],
        ylim: [0., 0.],
        xlimOpposite: [0., 0.],
        ylimOpposite: [0., 0.],
    };

    this.ticksParams = {
        fontSize: 10,
        xticks: null,
        xFixed: null,
        yticks: null,
        yFixed: null,
        xticksOpposite: null,
        xOppositeFixed: null,
        yticksOpposite: null,
        yOppositeFixed: null,
    };

    this.setMargin = function (vMargin, hMargin) {
        self.top = vMargin;
        self.left = hMargin;
        self.bottom = self.height - vMargin;
        self.right = self.width - hMargin;
    };

    this.xlabel = function (label) {
        self.labelParams.xlabel = label;
    };

    this.xlabelOpposite = function (label) {
        self.labelParams.xlabelOpposite = label;
    };

    this.ylabel = function (label) {
        self.labelParams.ylabel = label;
    };

    this.ylabelOpposite = function (label) {
        self.labelParams.ylabelOpposite = label;
    };

    this.xlim = function (left, right) {
        self.limParams.xlim = [left, right];
    };

    this.ylim = function (left, right) {
        self.limParams.ylim = [left, right];
    };

    this.xlimOpposite = function (left, right) {
        self.limParams.xlimOpposite = [left, right];
    };

    this.ylimOpposite = function (left, right) {
        self.limParams.ylimOpposite = [left, right];
    };

    this.xticks = function (ticks) {
        self.ticksParams.xticks = ticks.slice();
    };

    this.yticks = function (ticks) {
        self.ticksParams.yticks = ticks.slice();
    };

    this.xticksOpposite = function (ticks) {
        self.ticksParams.xticksOpposite = ticks.slice();
    };

    this.yticksOpposite = function (ticks) {
        self.ticksParams.yticksOpposite = ticks.slice();
    };

    this.hist = function (x, cumulative = false, color = undefined) {
        const min = Math.min.apply(null, x);
        const max = Math.max.apply(null, x);
        const n = Math.round(Math.log2(x.length)) + 1;
        const h = (max - min) / n;

        self.limParams.xlim[0] = min - h / 2.;
        self.limParams.xlim[1] = self.limParams.xlim[0] + (n + 1) * h;
        self.ticksParams.xticks = [];
        for (let i = min; i < self.limParams.xlim[1]; i += h) {
            self.ticksParams.xticks.push(i);
        }

        let accumulation = 0;
        const y = [];
        for (let left = self.limParams.xlim[0]; left < self.limParams.xlim[1]; left += h) {
            const right = left + h;
            const count = x.filter(function (i) {
                return left <= i && i < right;
            }).length;
            accumulation += count;
            if (cumulative) y.push(accumulation);
            else y.push(count);
        }

        const maxy = Math.max.apply(null, y);
        const dy = Math.ceil(maxy / 10.);
        self.limParams.ylim = [0, maxy];
        self.ticksParams.yticks = [];
        for (let i = 0; i <= maxy; i += dy) {
            self.ticksParams.yticks.push(i);
        }

        self.limParams.ylimOpposite[0] = 0;
        self.limParams.ylimOpposite[1] = 100. * maxy / x.length;
        self.ticksParams.yticksOpposite = [];
        for (let i = 0; i <= self.limParams.ylimOpposite[1]; i += 10) {
            self.ticksParams.yticksOpposite.push(i);
        }

        const plotFunc = function () {
            self.ctx.lineWidth = 1;
            self.ctx.strokeStyle = '#000000';

            for (let i = 0; i < y.length; ++i) {
                const lim = self.limParams.ylim;
                const barHeight = 1. * y[i] / lim[1] * (self.bottom - self.top);
                const barWidth = 1. * (self.right - self.left) / (n + 1);
                self.ctx.rect(self.left + i * barWidth, self.bottom - barHeight, barWidth, barHeight);
                self.ctx.stroke();

            }
            if (color) {
                self.ctx.fillStyle = color;
                self.ctx.fill();
            }
        };

        self.pltFunctions.push(plotFunc);
    };

    self.scatter = function (x, y, color = '#000000', size = 4) {
        const plotFunc = function () {
            self.ctx.fillStyle = color;

            for (let i = 0; i < x.length; ++i) {
                const xlim = self.limParams.xlim;
                const ylim = self.limParams.ylim;
                const screenX = self.left + 1. * (x[i] - xlim[0]) / (xlim[1] - xlim[0]) * (self.right - self.left);
                const screenY = self.top + 1. * (ylim[1] - y[i]) / (ylim[1] - ylim[0]) * (self.bottom - self.top);

                self.ctx.beginPath();
                self.ctx.arc(screenX, screenY, size / 2., 0, 2 * Math.PI, true);
                self.ctx.fill();
            }
        };

        self.pltFunctions.push(plotFunc);
    };

    self.plot = function (x, y, color = '#000000', width = 1) {
        const plotFunc = function () {
            self.ctx.strokeStyle = color;
            self.ctx.lineWidth = width;

            for (let i = 1; i < x.length; ++i) {
                const xlim = self.limParams.xlim;
                const ylim = self.limParams.ylim;

                const xs = self.left + 1. * (x[i - 1] - xlim[0]) / (xlim[1] - xlim[0]) * (self.right - self.left);
                const ys = self.top + 1. * (ylim[1] - y[i - 1]) / (ylim[1] - ylim[0]) * (self.bottom - self.top);
                const xt = self.left + 1. * (x[i] - xlim[0]) / (xlim[1] - xlim[0]) * (self.right - self.left);
                const yt = self.top + 1. * (ylim[1] - y[i]) / (ylim[1] - ylim[0]) * (self.bottom - self.top);

                self.ctx.beginPath();
                self.ctx.moveTo(xs, ys);
                self.ctx.lineTo(xt, yt);
                self.ctx.stroke();
            }
        };

        self.pltFunctions.push(plotFunc);
    };

    this.show = function () {
        // set default margin
        if (self.bottom === 0) self.setMargin(self.height * .15, self.width * .15);

        // border
        self.ctx.lineWidth = 2;
        self.ctx.strokeStyle = '#000000';
        self.ctx.strokeRect(self.left, self.top, self.right - self.left, self.bottom - self.top);

        // labels
        self.ctx.fillStyle = '#000000';
        self.ctx.textAlign = "center";
        setFontSize(self.ctx, self.labelParams.fontSize);

        if (self.labelParams.xlabel != null) {
            self.ctx.fillText(self.labelParams.xlabel, self.width / 2.,
                self.height - self.labelParams.fontSize * 1.5);
        }
        if (self.labelParams.xlabelOpposite != null) {
            self.ctx.fillText(self.labelParams.xlabelOpposite, self.width / 2., self.labelParams.fontSize * 2.);
        }

        if (self.labelParams.ylabel != null) {
            fillVerticalText(self.ctx, self.labelParams.ylabel,
                self.labelParams.fontSize * 2., self.height / 2.);
        }
        if (self.labelParams.ylabelOpposite != null) {
            fillVerticalText(self.ctx, self.labelParams.ylabelOpposite,
                self.width - self.labelParams.fontSize * 1.5, self.height / 2.);
        }

        // ticks
        self.ctx.textAlign = "center";
        setFontSize(self.ctx, self.ticksParams.fontSize);

        if (self.ticksParams.xticks != null) {
            self.ticksParams.xticks.forEach(function (tick) {
                const lim = self.limParams.xlim;
                const x = self.left + 1. * (tick - lim[0]) / (lim[1] - lim[0]) * (self.right - self.left);

                self.ctx.beginPath();
                self.ctx.moveTo(x, self.bottom);
                self.ctx.lineTo(x, self.bottom + 5);
                self.ctx.stroke();

                let text = tick.toString();
                if (self.ticksParams.xFixed != null) text = tick.toFixed(self.ticksParams.xFixed);
                self.ctx.fillText(text, x, self.bottom + 5 + self.ticksParams.fontSize * 1.5);
            });
        }
        if (self.ticksParams.xticksOpposite != null) {
            self.ticksParams.xticksOpposite.forEach(function (tick) {
                const lim = self.limParams.xlimOpposite;
                const x = self.left + 1. * (tick - lim[0]) / (lim[1] - lim[0]) * (self.right - self.left);

                self.ctx.beginPath();
                self.ctx.moveTo(x, self.top);
                self.ctx.lineTo(x, self.top - 5);
                self.ctx.stroke();

                let text = tick.toString();
                if (self.ticksParams.xOppositeFixed != null) text = tick.toFixed(self.ticksParams.xOppositeFixed);
                self.ctx.fillText(text, x, self.top - 5 - self.ticksParams.fontSize);
            });
        }

        self.ctx.textAlign = "end";
        if (self.ticksParams.yticks != null) {
            self.ticksParams.yticks.forEach(function (tick) {
                const lim = self.limParams.ylim;
                const y = self.top + 1. * (lim[1] - tick) / (lim[1] - lim[0]) * (self.bottom - self.top);

                self.ctx.beginPath();
                self.ctx.moveTo(self.left, y);
                self.ctx.lineTo(self.left - 5, y);
                self.ctx.stroke();

                let text = tick.toString();
                if (self.ticksParams.yFixed != null) text = tick.toFixed(self.ticksParams.yFixed);
                self.ctx.fillText(text, self.left - 10, y + self.ticksParams.fontSize * .25);
            });
        }

        self.ctx.textAlign = "start";
        if (self.ticksParams.yticksOpposite != null) {
            self.ticksParams.yticksOpposite.forEach(function (tick) {
                const lim = self.limParams.ylimOpposite;
                const y = self.top + 1. * (lim[1] - tick) / (lim[1] - lim[0]) * (self.bottom - self.top);

                self.ctx.beginPath();
                self.ctx.moveTo(self.right, y);
                self.ctx.lineTo(self.right + 5, y);
                self.ctx.stroke();

                let text = tick.toString();
                if (self.ticksParams.yOppositeFixed != null) text = tick.toFixed(self.ticksParams.yOppositeFixed);
                self.ctx.fillText(text, self.right + 10, y + self.ticksParams.fontSize * .25);
            });
        }

        self.pltFunctions.forEach(function (f) {
            f()
        });
    };
};
