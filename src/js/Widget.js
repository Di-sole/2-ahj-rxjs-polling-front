import { interval } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import {
  map, concatMap, take, tap,
} from 'rxjs/operators';

export default class Widget {
  constructor(container) {
    this.container = container;
    this.messagesList = null;
  }

  createWidget() {
    const widget = document.createElement('div');
    widget.classList.add('widget');
    widget.innerHTML = `
      <div class="widget-header-container">
        <h2 class="widget-header">Incoming</h2>
      </div>
      <div class="widget-messages-container">
        <table class="widget-messages"></table>
      </div>
    `;

    this.container.appendChild(widget);
    this.messagesList = this.container.querySelector('.widget-messages');
  }

  startStream() {
    interval(5000)
      .pipe(
        take(5),
        tap((v) => console.log(`Tap: ${v}`)),
        concatMap(() => ajax.getJSON('https://rxjs-polling.herokuapp.com/messages/unread/')),
        map((response) => response.messages),
      )
      .subscribe({
        next: (messages) => this.addNewMessages(messages),
        error: () => console.log('no new messages'),
        complete: () => console.log('complete'),
      });
  }

  addMessage(message) {
    const received = new Date(message.received).toLocaleString('ru');
    const dateEdited = `${received.substring(11, 17)} ${received.substring(0, 10)}`;
    const emailEdited = message.from.length <= 25 ? message.from : `${message.from.slice(0, 15)}...`;
    const subjectEdited = message.subject.length <= 15 ? message.subject : `${message.subject.slice(0, 15)}...`;

    const messageEl = document.createElement('tr');
    messageEl.classList.add('message-element');
    messageEl.dataset.id = message.id;
    messageEl.innerHTML = `
      <td class="message-author">${emailEdited}</td>
      <td class="message-subject">${subjectEdited}</td>
      <td class="message-date">${dateEdited}</td>
    `;

    this.messagesList.insertAdjacentElement('afterbegin', messageEl);
  }

  addNewMessages(data) {
    if (data.length >= 1) {
      data.forEach((mes) => this.addMessage(mes));
    }
  }
}
