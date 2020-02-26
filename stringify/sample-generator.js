
let stringifyHTML = require('../stringify');

// eslint-disable-next-line
console.log( stringifyHTML([
  {
    attrs: {
      class: 'mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-4 ns-subject page-Wikipedia_Portada rootpage-Wikipedia_Portada skin-vector action-view',
    },
    _: [
      {
        attrs: {
          id: 'mw-page-base',
          class: 'noprint',
        },
        $: 'div',
      },
      {
        attrs: {
          id: 'mw-head-base',
          class: 'noprint',
        },
        $: 'div',
      },
      {
        attrs: {
          id: 'content',
          class: 'mw-body',
          role: 'main',
        },
        _: [
          {
            attrs: {
              id: 'top',
            },
            $: 'a',
          },
          {
            attrs: {
              id: 'siteNotice',
              class: 'mw-body-content',
            },
            _: [
              {
                comments: ' CentralNotice ',
              },
            ],
            $: 'div',
          },
          {
            attrs: {
              class: 'mw-indicators mw-body-content',
            },
            $: 'div',
          },
          {
            attrs: {
              id: 'firstHeading',
              class: 'firstHeading',
              lang: 'es',
            },
            _: [
              {
                text: 'Wikipedia:Portada',
              },
            ],
            $: 'h1',
          },
          {
            attrs: {
              id: 'bodyContent',
              class: 'mw-body-content',
            },
            _: [
              {
                attrs: {
                  id: 'siteSub',
                },
                _: [
                  {
                    text: 'De Wikipedia, la enciclopedia libre',
                  },
                ],
                $: 'div',
              },
              {
                attrs: {
                  id: 'contentSub',
                },
                $: 'div',
              },
              {
                attrs: {
                  id: 'jump-to-nav',
                  class: 'mw-jump',
                },
                _: [
                  {
                    text: 'Saltar a:          ',
                  },
                  {
                    attrs: {
                      href: '#mw-head',
                    },
                    _: [
                      {
                        text: 'navegación',
                      },
                    ],
                    $: 'a',
                  },
                  {
                    text: ',           ',
                  },
                  {
                    attrs: {
                      href: '#p-search',
                    },
                    _: [
                      {
                        text: 'búsqueda',
                      },
                    ],
                    $: 'a',
                  },
                ],
                $: 'div',
              },
              {
                attrs: {
                  id: 'mw-content-text',
                  lang: 'es',
                  dir: 'ltr',
                  class: 'mw-content-ltr',
                },
                _: [
                  {
                    attrs: {
                      style: 'margin:4px 0 0 0;width:100%;background:none',
                    },
                    _: [
                      {
                        _: [
                          {
                            attrs: {
                              class: 'MainPageBG',
                              style: 'width:100%;border:1px solid #C7D0F8;background:#F2F5FD;vertical-align:top;color:#000;-moz-border-radius:4px;-webkit-border-radius:4px;border-radius:4px;',
                            },
                            unclosed: true,
                            $: 'td',
                          },
                        ],
                        unclosed: true,
                        $: 'tr',
                      },
                    ],
                    unclosed: true,
                    $: 'table',
                  },
                ],
                unclosed: true,
                $: 'div',
              },
            ],
            unclosed: true,
            $: 'div',
          },
        ],
        unclosed: true,
        $: 'div',
      },
    ],
    unclosed: true,
    $: 'body',
  },
]) );
