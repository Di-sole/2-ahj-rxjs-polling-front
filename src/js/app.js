import Widget from './Widget';

const container = document.querySelector('.container');
const widget = new Widget(container);

widget.createWidget();
widget.startStream();
