'use strict';

const pagination = new Vue({
    el: '#pagination',
    data: {
        pageNumber: pageNumber,
        prevHref: 0,
        nextHref: 0,
    },
    methods: {
        init: function() {
            this.prevHref = this.getLink(pageNumber - 1);
            this.nextHref = this.getLink(pageNumber + 1);
        },
        getLink: function (index) {
            if (0 < index && index < 6) return 'problem' + index + '.html';
            else return false;
        },
    },
});

pagination.init();
