import webui from '../webui/app';

export default function (req) {
    webui.client.emit('reqArrival', req.url);
};
