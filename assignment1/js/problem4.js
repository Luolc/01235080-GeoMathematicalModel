'use strict';

const Graph = function() {
    const self = this;
    this.vertices = [];
    this.edges = {};
    this.addVertex = function (key) {
        self.vertices.push(key);
        if (!(key in self.edges)) self.edges[key] = [];
    };
    this.addVertices = function (keys) {
        keys.forEach(function (key) {
            self.addVertex(key);
        });
    };
    this.addEdge = function (s, t, d) {
        self.edges[s].push({t: t, d: d});
    };
};

function dijkstra(graph, start, target) {
    const d = new Set();
    const prev = new Set();
    const visited = new Set();

    graph.vertices.forEach(function (v) {
        d[v] = 1e9;
        prev[v] = null;
        visited[v] = false;
    });

    d[start] = 0;

    for (let i = 0; i < graph.vertices.length; ++i) {
        let minDist = 1e9;
        let s = null;
        for (const v of graph.vertices) {
            if (!visited[v] && d[v] < minDist) {
                s = v;
                minDist = d[v];
            }
        }

        visited[s] = true;
        for (const edge of graph.edges[s]) {
            if (d[edge.t] > d[s] + edge.d) {
                d[edge.t] = d[s] + edge.d;
                prev[edge.t] = s;
            }
        }
    }

    let pathVertices = [];
    let current = target;
    while (current) {
        pathVertices.push(current);
        current = prev[current];
    }
    pathVertices.reverse();

    const path = pathVertices.reduce(function (a, b) {
        return a + " → " + b;
    });

    return {path: path, distance: d[target]};
}

const page = new Vue({
    el: '#main',
    data: {
        path: "",
        distance: 0,
    },
    methods: {
        init: function () {
            const graph = new Graph();
            graph.addVertices(["v1", "v2", "v3", "v4", "v5"]);
            graph.addEdge("v1", "v2", 3);
            graph.addEdge("v1", "v3", 5);
            graph.addEdge("v2", "v3", 7);
            graph.addEdge("v2", "v4", 5);
            graph.addEdge("v3", "v5", 6);
            graph.addEdge("v4", "v3", 7);
            graph.addEdge("v4", "v5", 1);

            const ans = dijkstra(graph, "v1", "v5");
            this.path = ans.path;
            this.distance = ans.distance;
        },
    },
});

page.init();

const pageNumber = 4;
