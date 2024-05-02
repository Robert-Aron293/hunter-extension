
class Main{
    constructor() {}

    handleData() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('onMessage request' + request.type);
            if (request?.type === 'block') {
                $('body').load('www.google.com');
            }
            sendResponse();
        });
    }
}

new Main();