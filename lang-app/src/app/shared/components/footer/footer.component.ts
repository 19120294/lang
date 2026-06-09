import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DISCLAIMER } from '../.././../core/models/hotline.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  readonly disclaimer = DISCLAIMER;
  readonly year = new Date().getFullYear();
}
