// Just a file containing usefull links to documentation of pixi and others or notes

// The “Bundles & Manifest” guide: “What is a Manifest?”, “What is a Bundle?”
// https://pixijs.com/8.x/guides/components/assets/manifest/
// https://pixijs.com/8.x/examples?example=assets_manifest_bundles - EXAMPLE

// The general Assets guide
// https://pixijs.com/8.x/guides/components/assets
// https://pixijs.download/v7.x/docs/PIXI.Assets.html

// https://pixijs.io/assetpack/ - could be usefull in future

// https://pixijs.com/8.x/guides/components/scene-objects/container
// https://pixijs.download/release/docs/scene.Container.html

// Debug games and apps written with PixiJS with PixiJS Devtools
// chrome extention I use 2.9.3
// https://pixijs.io/devtools/docs/guide/installation/
// https://chromewebstore.google.com/detail/pixijs-devtools/dlkffcaaoccbofklocbjcmppahjjboce

// https://pixijs.com/7.x/examples/events/dragging 


// https://refactoring.guru/design-patterns/mediator -> board ?

// https://www.typescriptlang.org/play/?#code/GYVwdgxgLglg9mABABwIYCcDOBTAQnDAEwAow4pVYEAuRTKdGMAcwEpaA3OGQxAbwBQiYYgA22KIhiIAvIgAMAbgFCR4yQFtUADwCSUbOkrwwmWYgCM864sQB6O3VTAJATzEwNMKKuHqpBkZUpuZKKiKIEAiYcOIAdKJwzMQA5NrpiGQUwQnYLFAAFikANJnkxgi5+QWsvogA7gUw4ojE0gA8ZdkmVcyFrPzhESLehhWmANQTysMjwK2jQSZmAHyIWnqB45gDgrOzUaax2HH1GGDEAES46NioANZMzGJwcMi0UK-rqGDui9sAQkurBm+wiACNbg9QbMAL5DWYweakcrBADaMAAurIZHIUnYUrs6mCYFMYWDIghYGAQNhyRF4cS5q0suMMdjcXjUITBhSRIcYvFEskUqhEAgpGBCNh7pgSlIQUzEWSlcNDtTafSRPCSciYJgAHKoA3EA0gDTgwwo7oIdmsAacxDAVCiHC7eyOGIBKRmMU0i2GRCFPKqiIC44JJKpf2W9DipBMaWy+UwRV84ThoVRlIGJAxwOfeVmgPoa1srH25ShkaICZyYuxsvoitV9OUo5ZkXpbRSFO1VU67UqRkCByIAAq2HoAjQWDwBHQJFFACZuYqVEA// function parseBoard(notation: string): void {


// en passant ideas
// rnbqkbnr/ppp1pppp/8/8/4P3/8/PPP2PPP/RNBQKBNR b KQkq - 0 3 - no en passant casue it is only just after the pwan moved two squres
// rnbqkbnr/ppp1pppp/8/3p4/4P3/3P4/PPP2PPP/RNBQKBNR b KQkq - 0 2 - no en passant casue it is only just after the pwan moved two squres
// rnbqkbnr/ppp2ppp/8/3p4/PP1Pp2P/8/2P1PPP1/RNBQKBNR b KQkq d3 0 4
// rnbqkbnr/ppp4p/8/3p1pp1/PP1PpPPP/8/2P1P3/RNBQKBNR b KQkq g3 0 6

// En passant can only be captured on the very next move after the pawn advances two squares. So only one possible, not even two per color. Just one. Good easier to handle.

// // chess.com and lichess are using dom elemts not canvas ? - > https://svelte.dev/
// GITHUB project out of this actually not just repo?

// coupling - sprzęganie

// https://refactoring.guru/design-patterns/factory-method #pieceFactory

// #Parameter Properties 

// dir and files structure windows command -> tree /f

// Can a pinned piece be involved in a checkmate? good anwser here:
// https://www.reddit.com/r/chess/comments/1mg4fi/comment/cc9k6mb/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button