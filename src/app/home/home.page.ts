import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


const circleR = 80;
const circleDasharray = 2 * Math.PI * circleR;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  time = new BehaviorSubject<string>('25:00');
  timer: number | undefined;
  interval: any;
  state: 'start' | 'stop' = 'stop'; // Initial state

  pomodoroDuration = 25; // Default duration in minutes
  shortBreakDuration = 5; // Default short break duration in minutes

  circleR = circleR;
  circleDasharray = circleDasharray;
  percent = new BehaviorSubject<number>(0);


  constructor() {
  }


  startTimer(duration: number) {
    this.state = 'start';
    clearInterval(this.interval); // Clear any existing interval

    this.timer = duration * 60; // Convert minutes to seconds
    this.updateTimeValue(); // Update immediately to show the initial value

    this.interval = setInterval(() => { this.updateTimeValue() }, 1000); // Update every second
  }


  stopTimer() {
    this.state = 'stop';
    clearInterval(this.interval); // Clear the interval to stop the timer
    this.time.next('00:00'); // Reset the time to 00:00
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
      const totalTime = this.pomodoroDuration * 60;
      const percentage = ((totalTime - this.timer) / totalTime) * 100;
      this.percent.next(percentage);


      this.timer = this.timer - 1; // Decrease timer by 1 second


      if (this.timer < -1) {
        this.swapDuration();
        this.startTimer(this.pomodoroDuration);
      }

    }
  }


  swapDuration() {
    this.pomodoroDuration = this.pomodoroDuration === 25 ? 5 : 25; // Swap between 25 and 5 minutes
  }


  percentageOffset(percent: any) {
    const percentFloat = percent / 100;
    return circleDasharray * (1 - percentFloat);
  }

}
