import { IsString } from 'class-validator';

/** The reason is a text; a blank one is refused by the domain, which names the refusal. */
export class CloseAlertBody {
  @IsString()
  reason = '';
}
