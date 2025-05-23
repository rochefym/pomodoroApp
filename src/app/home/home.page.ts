import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationsService } from '../services/notifications.service';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { getDefaultTimezone, formatDateInTimezone } from '../utils/timezone-util';
import { App } from '@capacitor/app';


const circleR = 80;
const circleDasharray = 2 * Math.PI * circleR;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  time = new BehaviorSubject<string>('25:00');
  timer: number | undefined;
  interval: any;
  state: 'start' | 'stop' = 'stop'; // Initial state

  pomodoroDuration = 25; // Default duration in minutes
  shortBreakDuration = 5; // Default short break duration in minutes

  circleR = circleR;
  circleDasharray = circleDasharray;
  percent = new BehaviorSubject<number>(0);

  currentTime: string = '';
  pomodoroMinutes = 25;
  pomodoroSeconds = 0;

  breakMinutes = 5;
  breakSeconds = 0;

  isPomodoro = true;


  async ngOnInit() {
    const permissions = await this.notificationsService.requestNotificationPermissions();
    this.notificationsService.listenForIncomingNotifications();
  }

  constructor(private platform: Platform, private notificationsService: NotificationsService, private routerOutlet: IonRouterOutlet) {

    this.platform.backButton.subscribeWithPriority(-1, () => {
      if (!this.routerOutlet.canGoBack()) {
        App.exitApp();
        // App.minimizeApp();
      }
    });
  }



  startTimer(durationInSeconds: number = this.getCurrentDuration()) {
    this.state = 'start';
    clearInterval(this.interval); // Clear any existing interval

    this.timer = durationInSeconds; // Convert minutes to seconds
    this.updateTimeValue(); // Update immediately to show the initial value

    this.interval = setInterval(() => { this.updateTimeValue() }, 1000); // Update every second
  }


  stopTimer() {
    this.state = 'stop';
    clearInterval(this.interval);

    const minutes = String('0' + this.pomodoroMinutes).slice(-2);
    const seconds = String('0' + this.pomodoroSeconds).slice(-2);
    this.time.next(`${minutes}:${seconds}`);
  }


  pauseTimer() {
    //this.state = 'pause';
    this.timer = this.timer
    clearInterval(this.interval);

    if (this.timer !== undefined) {
      let minutes: any = this.timer / 60;
      let seconds: any = this.timer % 60;

      minutes = String('0' + Math.floor(minutes)).slice(-2);
      seconds = String('0' + Math.floor(seconds)).slice(-2);

      const text = minutes + ':' + seconds;
      this.time.next(text);

      //Percentage update 
      const totalTime = this.pomodoroDuration * 60;
      const percentage = ((totalTime - this.timer) / totalTime) * 100;
      this.percent.next(percentage);
    }
  }


  updateTimeValue() {
    if (this.timer !== undefined) {
      let minutes: any = this.timer / 60;
      let seconds: any = this.timer % 60;

      minutes = String('0' + Math.floor(minutes)).slice(-2);
      seconds = String('0' + Math.floor(seconds)).slice(-2);

      const text = minutes + ':' + seconds;
      this.time.next(text);


      //Percentage update 
      const totalTime = this.getCurrentDuration();
      const percentage = ((totalTime - this.timer) / totalTime) * 100;
      this.percent.next(percentage);


      this.timer = this.timer - 1; // Decrease timer by 1 second


      if (this.timer < -1) {
        //NOTIFY WHEN THE POMODORO 25-MIN TIME DURATION IS OVER OR THE 5-MIN BREAK IS OVER
        if (this.isPomodoro) {
          this.createNotification();
          this.swapDuration();
          this.startTimer(this.getCurrentDuration());
        } else {
          this.stopTimer();
          this.swapDuration();
          this.createBreakNotification();
        }
      }

    }
  }

  swapDuration() {
    this.isPomodoro = !this.isPomodoro;
  }

  getCurrentDuration(): number {
    return this.isPomodoro
      ? (this.pomodoroMinutes * 60 + this.pomodoroSeconds)
      : (this.breakMinutes * 60 + this.breakSeconds);
  }

  percentageOffset(percent: any) {
    const percentFloat = percent / 100;
    return circleDasharray * (1 - percentFloat);
  }


  //NOTIFICATIONS FOR 25-MINUTES POMODORO AND 5 MINUTES BREAK
  async requestPermissions() {
    const permissions = await this.notificationsService.requestNotificationPermissions();
    alert(`Updated Permissions: ${JSON.stringify(permissions)}`);
  }

  async createNotification() {
    const permissions = await this.notificationsService.checkNotificationPermissions();

    if (permissions.display !== 'granted') {
      alert('Notification permissions not granted. Requesting permissions...');
      await this.requestPermissions();
    }

    const notification: any = {
      title: 'Pomodoro Alert',
      body: '25-minute work session is over. Time for a break!',
      id: 1,
      schedule: { at: new Date(new Date().getTime() + 1000) },
      sound: 'default',
      attachments: null,
      actionTypeId: '',
      extra: null,
      vibrate: true,
    };

    await this.notificationsService.scheduleNotification(notification);
  }

  async createBreakNotification() {
    const permissions = await this.notificationsService.checkNotificationPermissions();

    if (permissions.display !== 'granted') {
      alert('Notification permissions not granted. Requesting permissions...');
      await this.requestPermissions();
    }

    const notification: any = {
      title: 'Break Alert',
      body: '5-minute break is done! Start another Pomodoro session?',
      id: 2,
      schedule: { at: new Date(new Date().getTime() + 1000) },
      sound: 'default',
      attachments: null,
      actionTypeId: '',
      extra: null,
      vibrate: true,
    };

    await this.notificationsService.scheduleNotification(notification);
  }


}
