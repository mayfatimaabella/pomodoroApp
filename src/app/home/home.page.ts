import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {

  time: string | any;
  countdown: string | null = null;
  isBreak: boolean = false;
  isRunning: boolean = false;
  private interval: any;
  private countdownInterval: any;
  completedPomodoros: number = 0;
  sessionLabel: string = '';

  constructor(private platform: Platform) {}

  ngOnInit() {
    this.currentTime();
    this.interval = setInterval(() => this.currentTime(), 1000);

    if ('Notification' in window) {
      Notification.requestPermission();
    }

    this.platform.backButton.subscribeWithPriority(10, () => {
      App.exitApp();
    });
  }

  currentTime() {
    const timeNow = new Date();
    this.time = timeNow.toLocaleTimeString();
  }

  startPomodoro() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isBreak = false;
    this.sessionLabel = 'Pomodoro Session';

    const endTime = Date.now() + 25 * 60 * 1000;

    this.countdownInterval = setInterval(() => {
      const remainingTime = endTime - Date.now();
      if (remainingTime <= 0) {
        clearInterval(this.countdownInterval);
        this.countdown = "Time's up!";
        this.completedPomodoros++;
        this.notifyUser('Pomodoro Complete!', 'Take a short or long break.');
        this.startBreak();
        return;
      }
      this.updateCountdown(remainingTime);
    }, 1000);
  }

  startBreak() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.isBreak = true;
    const isLongBreak = this.completedPomodoros % 4 === 0;
    const breakMinutes = isLongBreak ? 15 : 5;
    this.sessionLabel = isLongBreak ? 'Long Break' : 'Short Break';

    const endTime = Date.now() + breakMinutes * 60 * 1000;

    this.countdownInterval = setInterval(() => {
      const remainingTime = endTime - Date.now();
      if (remainingTime <= 0) {
        clearInterval(this.countdownInterval);
        this.countdown = "Break's over!";
        this.notifyUser('Break Complete!', 'Ready for another Pomodoro?');
        this.resetState();
        return;
      }
      this.updateCountdown(remainingTime);
    }, 1000);
  }

  updateCountdown(ms: number) {
    const minutes = Math.floor(ms / 1000 / 60);
    const seconds = Math.floor((ms / 1000) % 60);
    this.countdown = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  notifyUser(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: 'assets/icon/pomodoro.png',
      });
    }

    const audio = new Audio('assets/audio/notification.mp3');
    audio.play();

    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }

  resetState() {
    this.countdown = null;
    this.isBreak = false;
    this.isRunning = false;
    this.sessionLabel = '';
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
