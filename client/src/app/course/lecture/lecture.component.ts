import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-lecture',
  templateUrl: './lecture.component.html',
  styleUrl: './lecture.component.css',
})
export class LectureComponent {
  @Input() vdUrl: string = '';
}
