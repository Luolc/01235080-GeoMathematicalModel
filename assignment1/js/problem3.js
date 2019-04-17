'use strict';

const Point = function (x, y) {
    this.x = parseFloat(x);
    this.y = parseFloat(y);
};

const points = [
    {label: 'A', x: 45.0, y: 69.0},
    {label: 'B', x: 18.0, y: 56.0},
    {label: 'C', x: 23.0, y: 58.0},
    {label: 'D', x: 36.0, y: 51.0},
    {label: 'E', x: 57.0, y: 52.0},
    {label: 'F', x: 25.0, y: 48.0},
    {label: 'G', x: 36.0, y: 48.0},
    {label: 'H', x: 32.0, y: 41.0},
    {label: 'I', x: 18.0, y: 47.0},
    {label: 'J', x: 57.0, y: 49.0},
    {label: 'K', x: 19.0, y: 39.0},
    {label: 'L', x: 27.0, y: 33.0},
    {label: 'M', x: 35.0, y: 35.0},
    {label: 'N', x: 47.0, y: 39.0},
    {label: 'O', x: 57.0, y: 32.0},
    {label: 'P', x: 38.0, y: 28.0},
    {label: 'Q', x: 48.0, y: 29.0},
    {label: 'R', x: 56.0, y: 22.0},
    {label: 'S', x: 25.0, y: 18.0},
    {label: 'T', x: 30.0, y: 19.0},];

function distance(p1, p2) {
    // suppress computing the point itself
    if (p1.x === p2.x && p1.y === p2.y) return 1e9;

    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}

function angle(s, t) {
    // suppress computing the point itself
    if (s.x === t.x && s.y === t.y) return 2 * Math.PI + 1;

    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const a = Math.acos(dx / Math.sqrt(dx * dx + dy * dy));
    if (dy > 0) return a;
    else return 2 * Math.PI - a;
}

const page = new Vue({
    el: '#main',
    data: {
        points: points,
        width: 0,
        height: 0,
        ctx: null,
        sequentialMethodPoints: null,
        sequentialMethodN: 0,
        sequentialMethodAns: 0,
        regionMethodPoints: null,
        regionMethodN: 0,
        regionMethodAns: 0,
    },
    methods: {
        init: function () {
            const canvas = this.$refs.canvas;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            this.width = canvas.width;
            this.height = canvas.height;
            this.ctx = canvas.getContext('2d');
            this.ctx.font = '11px Arial';

            this.drawPoints();
            this.drawBorder();

            this.sequentialMethod();
            this.regionMethod();
        },
        project: function (x, y) {
            x = x * this.width / 70.0;
            y = this.height - y * this.height / 80.0;
            return new Point(x, y);
        },
        drawPoints: function () {
            const pointSize = 2.5;
            points.forEach(function (p) {
                const point = this.project(p.x, p.y);
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI, true);
                this.ctx.fill();

                this.ctx.fillText(p.label, point.x - 12, point.y + 6);
            }, this);
        },
        drawBorder: function () {
            const leftTop = this.project(10, 70);
            const rightBottom = this.project(60, 10);
            const width = rightBottom.x - leftTop.x;
            const height = rightBottom.y - leftTop.y;
            this.ctx.strokeRect(leftTop.x, leftTop.y, width, height);

            const leftBottom = this.project(10, 10);
            const rightTop = this.project(60, 70);
            this.ctx.fillText("(10,10)", leftBottom.x - 20, leftBottom.y + 16);
            this.ctx.fillText("(60,70)", rightTop.x - 12, rightTop.y - 8);
        },
        sequentialMethod: function () {
            this.sequentialMethodPoints = points.map(function (p) {
                const rib = Math.min(p.x - 10, 60 - p.x, p.y - 10, 70 - p.y);
                const distances = points.map(function (p2) {
                    return distance(p, p2);
                });
                const minDist = Math.min.apply(null, distances);
                return {
                    label: p.label,
                    min: minDist,
                    minText: minDist > rib ? "" : minDist.toFixed(2),
                    rib: rib,
                    ribText: rib.toFixed(1),
                };
            });

            this.sequentialMethodN = this.sequentialMethodPoints.filter(function (x) {
                return x.min <= x.rib;
            }).length;
            this.sequentialMethodAns = this.sequentialMethodPoints.reduce(function (a, b) {
                if (b.min <= b.rib) return a + b.min;
                else return a;
            }, 0) / this.sequentialMethodN;
        },
        regionMethod: function () {
            const regions = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]].map(function (interval) {
                return [interval[0] * Math.PI / 3., interval[1] * Math.PI / 3.];
            });

            this.regionMethodPoints = points.map(function (p) {
                const rib = Math.min(p.x - 10, 60 - p.x, p.y - 10, 70 - p.y);
                const angleAndDistances = points.map(function (p2) {
                    return {angle: angle(p, p2), dist: distance(p, p2)};
                });
                const results = regions.map(function (interval) {
                    const left = interval[0];
                    const right = interval[1];
                    const filtered = angleAndDistances.filter(function (i) {
                        return left <= i.angle && i.angle < right;
                    });
                    if (filtered.length === 0) return {min: 1e9, minText: ""};
                    else {
                        const distances = filtered.map(function (i) {
                            return i.dist;
                        });
                        const minDist = Math.min.apply(null, distances);
                        return {min: minDist, minText: minDist > rib ? "" : minDist.toFixed(2)};
                    }
                });
                results.sort(function (lhs, rhs) {
                    return lhs.min - rhs.min;
                });
                return {
                    label: p.label,
                    results: results,
                    min: results[0].min,
                    rib: rib,
                    ribText: rib.toFixed(1),
                };
            });

            this.regionMethodN = this.regionMethodPoints.filter(function (x) {
                return x.min <= x.rib;
            }).length;
            this.regionMethodAns = this.regionMethodPoints.reduce(function (a, b) {
                if (b.min <= b.rib) return a + b.min;
                else return a;
            }, 0) / this.regionMethodN;
        }
    },
});

page.init();

const pageNumber = 3;
