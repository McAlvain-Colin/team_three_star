import { Pipe, PipeTransform } from '@angular/core';
import Filter from 'bad-words';

@Pipe({
  name: 'badWordsFilter',
  standalone: true,
})
export class BadWordsFilterPipe implements PipeTransform {
  transform(value: string): string {
    const filter = new Filter();
    filter.removeWords('Dick');
    return filter.clean(value);
  }
}
