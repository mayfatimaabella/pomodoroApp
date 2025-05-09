import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  time: string = '';
  countdown: string | null = null;
  isBreak: boolean = false;
  isRunning: boolean = false;
  private interval: any;
  private countdownInterval: any;
  completedPomodoros: number = 0;
  sessionLabel: string = '';
  pomodoroDuration: number = 25;
  breakDuration: number = 5;
  constructor(private platform: Platform) {}

  async ngOnInit() {
    this.currentTime();
    this.interval = setInterval(() => this.currentTime(), 1000);

    const permResult = await LocalNotifications.requestPermissions();
    if (permResult.display !== 'granted') {
      console.warn('Local notifications not permitted.');
    }

    this.platform.backButton.subscribeWithPriority(10, () => {
      App.exitApp();
    });
  }

  currentTime() {
    this.time = new Date().toLocaleTimeString();
  }

  startPomodoro() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isBreak = false;
    this.sessionLabel = 'Pomodoro Session';

    const endTime = Date.now() + this.pomodoroDuration * 60 * 1000;

    this.countdownInterval = setInterval(() => {
      const remainingTime = endTime - Date.now();
      if (remainingTime <= 0) {
        clearInterval(this.countdownInterval);
        this.countdown = "Time's up!";
        this.completedPomodoros++;
        this.notifyUser('Pomodoro Complete!', 'Take a break.');
        this.startBreak();
        return;
      }
      this.updateCountdown(remainingTime);
    }, 1000);
  }

  pausePomodoro() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.isRunning = false;
  }

  startBreak() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.isBreak = true;
    const isLongBreak = this.completedPomodoros % 4 === 0;
    const breakMinutes = isLongBreak ? this.breakDuration + 10 : this.breakDuration;
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

  async notifyUser(title: string, body: string) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 10000),
            title,
            body,
            schedule: { at: new Date(Date.now() + 100) },
            smallIcon: 'ic_stat_icon_config_sample',
            sound: 'beep.aiff',
          },
        ],
      });
    } catch (error) {
      console.warn('Notification failed:', error);
    }

    const audio = new Audio('assets/audio/notification.mp3');
    audio.play().catch(() => console.warn('Audio playback failed.'));

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
