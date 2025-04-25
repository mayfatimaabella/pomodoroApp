import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  time: string | any;
  private interval : any;

  constructor() {}

  ngOnInit() {
    this.currentTime();
    this.interval = setInterval(() => {
      this.currentTime(); 
    }, 1000);
    
  }

  currentTime(){
    const timeNow = new Date();
    this.time = timeNow.toLocaleTimeString();
  }

  ngOnDestroy(){
    clearInterval(this.interval);
  }

}
