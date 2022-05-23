import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocutusDirective } from './directives/locutus.directive';
import { LocutussPipe } from './pipes/locutus.pipe';
import { LocutusService } from './services/locutus.service';
import { LazyLocutusGuard } from './guards/lazy-locutus.guard';
import { RootTranslationConfiguration, TranslationConfiguration } from './models/translation-configuration.model';
import { TRANSLATION_CONFIGURATIONS } from './injection-tokens';


function initializeAppFactory(configs: (TranslationConfiguration | RootTranslationConfiguration)[], locutus: LocutusService): () => void {
  return () => {
      configs.forEach(config => {
        if (Object.keys(config).includes('language')) {
          locutus.registerRoot(config as RootTranslationConfiguration);
        }
        else {
          locutus.registerChild({
            scope: config.scope,
            loaders: config.loaders
          });
        }
      });
  };
}

@NgModule({
  declarations: [
    LocutusDirective,
    LocutussPipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LocutusDirective,
    LocutussPipe
  ]
})
export class LocutusModule {

  constructor() {}

  static forRoot(configs: (TranslationConfiguration | RootTranslationConfiguration)[]): ModuleWithProviders<LocutusModule> {
    return {
      ngModule: LocutusModule,
      providers: [
        {
          provide: TRANSLATION_CONFIGURATIONS,
          useValue: configs,
        },
        {
          provide: APP_INITIALIZER,
          useFactory: initializeAppFactory,
          deps: [
            TRANSLATION_CONFIGURATIONS,
            LocutusService
          ],
          multi: true
        },
      ]
    };
  }

  static forChild(configs: TranslationConfiguration[]): ModuleWithProviders<LocutusModule> {
    return {
      ngModule: LocutusModule,
      providers: [
        {
          provide: TRANSLATION_CONFIGURATIONS,
          useValue: configs,
        },
        {
          provide: LazyLocutusGuard,
          deps: [TRANSLATION_CONFIGURATIONS, LocutusService]
        },
        {
          provide: APP_INITIALIZER,
          useFactory: initializeAppFactory,
          deps: [
            TRANSLATION_CONFIGURATIONS,
            LocutusService
          ],
          multi: true
        },
      ]
    };
  }
}
