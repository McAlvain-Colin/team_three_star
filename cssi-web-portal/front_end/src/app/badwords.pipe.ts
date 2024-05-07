import { Pipe, PipeTransform } from '@angular/core';
import Filter from 'bad-words';

@Pipe({
  name: 'badWordsFilter',
  standalone: true,
})
// This pipe was made to filter out bad words with the badwords library, but wasn"t really used because a pipe only alters the view< and not thevariable itself< so bad words could still be submitted.
export class BadWordsFilterPipe implements PipeTransform {
  transform(value: string): string {
    const filter = new Filter();
    filter.removeWords('Dick');
    return filter.clean(value);
  }
}
