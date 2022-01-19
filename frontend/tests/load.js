import http from 'k6/http';

export const options = {
    //   hosts: { 'test.k6.io': '1.2.3.4' },
    stages: [
        // { duration: '20s', target: 100 },
        { duration: '0s', target: 1000 },
        { duration: '20s', target: 1000 },
        // { duration: '20s', target: 0 },
    ],
    //   thresholds: { http_req_duration: ['avg<100', 'p(95)<200'] },
    //   noConnectionReuse: true,
    //   userAgent: 'MyK6UserAgentString/1.0',
};

export default function () {
    http.get('https://wordn.nl/');
}