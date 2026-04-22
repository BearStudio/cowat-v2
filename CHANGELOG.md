# [1.3.0](https://github.com/BearStudio/cowat-v2/compare/v1.2.0...v1.3.0) (2026-04-22)


### Bug Fixes

* add confirmation modal when cancelling a pending invitation ([#252](https://github.com/BearStudio/cowat-v2/issues/252)) ([dd754ee](https://github.com/BearStudio/cowat-v2/commit/dd754eecdac12677c35f3935a17a7009ab09f3fe)), closes [#167](https://github.com/BearStudio/cowat-v2/issues/167)
* allow re-requesting a booking after cancel or refusal ([#248](https://github.com/BearStudio/cowat-v2/issues/248)) ([86a505b](https://github.com/BearStudio/cowat-v2/commit/86a505b55729bb70a2081177896dcf0e7860d4d2))
* animate tab indicator and disable stop links in templates ([#256](https://github.com/BearStudio/cowat-v2/issues/256)) ([c231095](https://github.com/BearStudio/cowat-v2/commit/c23109518ed38b8716283ca0f3e18d1a35aee047))
* **ci:** deduplicate code quality runs via concurrency group ([429c252](https://github.com/BearStudio/cowat-v2/commit/429c2529efd7e9f23550869aeb6a1dc245a1d578))
* **ci:** only run PR title check on open and edit events ([#277](https://github.com/BearStudio/cowat-v2/issues/277)) ([54b6872](https://github.com/BearStudio/cowat-v2/commit/54b687225f15668c611dde9ebba73ed5113d0ee7))
* **ci:** remove push trigger to prevent duplicate workflow runs ([824a111](https://github.com/BearStudio/cowat-v2/commit/824a11158dd78010cd445571edfa09627cf9e6b0))
* **ci:** restore code quality PR trigger ([#297](https://github.com/BearStudio/cowat-v2/issues/297)) ([8e1b96b](https://github.com/BearStudio/cowat-v2/commit/8e1b96b79cfa83bfa9af5a86ff2282379fecf806))
* **ci:** skip PR title check for release PRs targeting main ([f86d4da](https://github.com/BearStudio/cowat-v2/commit/f86d4dabd8676f92ba655fafbff2299bcc0b1d1b))
* **cron:** Cron time is 6 FR time ([#289](https://github.com/BearStudio/cowat-v2/issues/289)) ([84cc3af](https://github.com/BearStudio/cowat-v2/commit/84cc3af2bae5f524cbd00d126d6475252a7c1927)), closes [#283](https://github.com/BearStudio/cowat-v2/issues/283)
* **dashboard:** commute rangeEnd dashboard ([#307](https://github.com/BearStudio/cowat-v2/issues/307)) ([3811e35](https://github.com/BearStudio/cowat-v2/commit/3811e35979a483d7c6585ed424b7e7cca6368516)), closes [#306](https://github.com/BearStudio/cowat-v2/issues/306)
* focus and scroll to input when adding a stop ([#249](https://github.com/BearStudio/cowat-v2/issues/249)) ([586595b](https://github.com/BearStudio/cowat-v2/commit/586595bef32284e4038dd632fd5802becf075063)), closes [#153](https://github.com/BearStudio/cowat-v2/issues/153)
* improve database seeds with fewer users and correct timings ([#268](https://github.com/BearStudio/cowat-v2/issues/268)) ([7438a02](https://github.com/BearStudio/cowat-v2/commit/7438a02569331c4d10ee8d9faa51000f7a500c41))
* increase active tab indicator opacity in dark mode ([#267](https://github.com/BearStudio/cowat-v2/issues/267)) ([5ada7ea](https://github.com/BearStudio/cowat-v2/commit/5ada7ea32a117b8ee2d8d6a73b301a70e98746aa))
* **navigation:** org switcher to stay on the current page ([#259](https://github.com/BearStudio/cowat-v2/issues/259)) ([e7aea81](https://github.com/BearStudio/cowat-v2/commit/e7aea81f23adbc634bc076a7daab83f285583449)), closes [#116](https://github.com/BearStudio/cowat-v2/issues/116) [#233](https://github.com/BearStudio/cowat-v2/issues/233)
* **notification:** auto accept notification ([#286](https://github.com/BearStudio/cowat-v2/issues/286)) ([d68c67c](https://github.com/BearStudio/cowat-v2/commit/d68c67cff2f75bac0e253f9a9460f31d16014517)), closes [#281](https://github.com/BearStudio/cowat-v2/issues/281)
* **notification:** do not send notification if no passenger ([#288](https://github.com/BearStudio/cowat-v2/issues/288)) ([e455829](https://github.com/BearStudio/cowat-v2/commit/e4558290298cc423ea1b03542ffe9b3818ec1743)), closes [#287](https://github.com/BearStudio/cowat-v2/issues/287)
* notify passengers when commute is modified ([#250](https://github.com/BearStudio/cowat-v2/issues/250)) ([91b6298](https://github.com/BearStudio/cowat-v2/commit/91b62986c39733f7942ae46980969a6902cac557))
* pass baseUrl to commute.created Slack broadcast blocks ([4c08960](https://github.com/BearStudio/cowat-v2/commit/4c08960120b6f85b2f43a2cb5a403dcd2d9a527b))
* preserve bookings on commute edit, cancel on seat reduction ([#254](https://github.com/BearStudio/cowat-v2/issues/254)) ([7c7b0ba](https://github.com/BearStudio/cowat-v2/commit/7c7b0ba438bfa45f2d74cba2d199999979ea04e2))
* prevent driver from booking seats on their own commute ([#142](https://github.com/BearStudio/cowat-v2/issues/142)) ([6eb58c5](https://github.com/BearStudio/cowat-v2/commit/6eb58c5aea2557073432d201344db49ee06f65ca))
* prevent driver from opening booking drawer for own commute ([#141](https://github.com/BearStudio/cowat-v2/issues/141)) ([29dbd78](https://github.com/BearStudio/cowat-v2/commit/29dbd78b5e90b373cbd6a6e81ac0420d90082949))
* replace raw Slack mrkdwn syntax with jsx-slack components ([#116](https://github.com/BearStudio/cowat-v2/issues/116)) ([2300b77](https://github.com/BearStudio/cowat-v2/commit/2300b7723bee18cb7e339e1aa3e71da4a79e255a))
* serialize array search params as JSON in routeUrl ([#261](https://github.com/BearStudio/cowat-v2/issues/261)) ([f24123e](https://github.com/BearStudio/cowat-v2/commit/f24123e8c2d5c97bba656cbbd7eefeb1950756f8)), closes [#242](https://github.com/BearStudio/cowat-v2/issues/242)
* **test:** run session revoke before user deletion ([04455cc](https://github.com/BearStudio/cowat-v2/commit/04455ccdfe8de8a4226c0f40cdc9d7e582d0a2bc))
* **test:** search user before revoking session to handle pagination ([713bda4](https://github.com/BearStudio/cowat-v2/commit/713bda43982eac39fe4b25ffda945980165d4caa))
* **test:** update booking ([#280](https://github.com/BearStudio/cowat-v2/issues/280)) ([93796d1](https://github.com/BearStudio/cowat-v2/commit/93796d102fb17280aa7315da771431ddbb70cb71)), closes [#178](https://github.com/BearStudio/cowat-v2/issues/178)
* update e2e tests and enable CI workflow ([#235](https://github.com/BearStudio/cowat-v2/issues/235)) ([38ed3e1](https://github.com/BearStudio/cowat-v2/commit/38ed3e103cbf80d0be1da44f4d7f597203a720db)), closes [#234](https://github.com/BearStudio/cowat-v2/issues/234)
* update pr-title workflow content ([24671ad](https://github.com/BearStudio/cowat-v2/commit/24671ad475e3022f8ce9e6c741340af5bb282e94))


### Features

* **account:** improve avatar and name editing UX ([#263](https://github.com/BearStudio/cowat-v2/issues/263)) ([c2a5ae1](https://github.com/BearStudio/cowat-v2/commit/c2a5ae17820c57dd44eb8fd71afa89caf56b4f24))
* better loading states with layout-matching skeletons ([#246](https://github.com/BearStudio/cowat-v2/issues/246)) ([198219f](https://github.com/BearStudio/cowat-v2/commit/198219f6f450aeef41a64052f01075f89060bb35)), closes [#240](https://github.com/BearStudio/cowat-v2/issues/240)
* **commute:** show template picker below details step ([#278](https://github.com/BearStudio/cowat-v2/issues/278)) ([1f902e3](https://github.com/BearStudio/cowat-v2/commit/1f902e3a5b00b623f16d08731c86774cc1acac15))
* **e2e:** manager organization — view details and update settings ([#138](https://github.com/BearStudio/cowat-v2/issues/138)) ([5a07d0b](https://github.com/BearStudio/cowat-v2/commit/5a07d0b3db6f5dc34423855803e09473d31434b0))
* improve request cards UX and commute request redirect ([#266](https://github.com/BearStudio/cowat-v2/issues/266)) ([a7f5b31](https://github.com/BearStudio/cowat-v2/commit/a7f5b31181ff21c9e3df3f6d944af5ba7115d80a))
* improve template picker and account pages UX ([#262](https://github.com/BearStudio/cowat-v2/issues/262)) ([869785f](https://github.com/BearStudio/cowat-v2/commit/869785ff9fd8a212d2a4b78aff0a639db3ef87ae))
* include commute requests in navbar badge count ([#245](https://github.com/BearStudio/cowat-v2/issues/245)) ([ccf1ff3](https://github.com/BearStudio/cowat-v2/commit/ccf1ff3df10ba32d9ba7a967887d83a06f65499a)), closes [#243](https://github.com/BearStudio/cowat-v2/issues/243)
* move step navigation to top with progress bar and quick create banner ([#264](https://github.com/BearStudio/cowat-v2/issues/264)) ([d06cd72](https://github.com/BearStudio/cowat-v2/commit/d06cd72a2fe4be68a83b06d05fc90b1c5a308993))
* prefetch query data in route loaders ([#255](https://github.com/BearStudio/cowat-v2/issues/255)) ([501b4b9](https://github.com/BearStudio/cowat-v2/commit/501b4b961a68ddc085636a26718275622df5fe6e))
* Redesign commute card timeline ([#299](https://github.com/BearStudio/cowat-v2/issues/299)) ([5d502d4](https://github.com/BearStudio/cowat-v2/commit/5d502d4cd718f80535dcac5bd6fd1ca0d57cc6b4))
* redesign location cards with map preview and streamlined actions ([#265](https://github.com/BearStudio/cowat-v2/issues/265)) ([13d5584](https://github.com/BearStudio/cowat-v2/commit/13d5584f26e546020278b85cec6100adbf07c676))
* simplify commute creation flow and remove speed dials ([#260](https://github.com/BearStudio/cowat-v2/issues/260)) ([d78ae07](https://github.com/BearStudio/cowat-v2/commit/d78ae0736a38b40e1ed2c085e834c37ffccf8636))
* **test:** Add create + remove org ([#292](https://github.com/BearStudio/cowat-v2/issues/292)) ([46fae65](https://github.com/BearStudio/cowat-v2/commit/46fae65c3757603b67f8ab6ae37f66dd657903aa)), closes [#181](https://github.com/BearStudio/cowat-v2/issues/181)
* **test:** Add login as owner test ([#290](https://github.com/BearStudio/cowat-v2/issues/290)) ([2773a6f](https://github.com/BearStudio/cowat-v2/commit/2773a6f77d52ebce600b1f8aae2e2bee29f78d9d)), closes [#180](https://github.com/BearStudio/cowat-v2/issues/180) [#180](https://github.com/BearStudio/cowat-v2/issues/180)
* **test:** add logout test ([#284](https://github.com/BearStudio/cowat-v2/issues/284)) ([98dbbb8](https://github.com/BearStudio/cowat-v2/commit/98dbbb82763838648706c7e28944a2f31e985a20)), closes [#176](https://github.com/BearStudio/cowat-v2/issues/176)
* **test:** add revoke user session test ([#291](https://github.com/BearStudio/cowat-v2/issues/291)) ([05a48ea](https://github.com/BearStudio/cowat-v2/commit/05a48ea32ddb627b4eb74a4c7f5b7ba6d8b59089)), closes [#186](https://github.com/BearStudio/cowat-v2/issues/186)
* UI polish pass — font, colors, dashboard, timeline, empty states ([#247](https://github.com/BearStudio/cowat-v2/issues/247)) ([e9426da](https://github.com/BearStudio/cowat-v2/commit/e9426daf455bd63af119f45db3f83d5d971e31cf))

# [1.2.0](https://github.com/BearStudio/cowat-v2/compare/v1.1.0...v1.2.0) (2026-04-02)


### Bug Fixes

* add confirmation modal when cancelling a pending invitation ([#252](https://github.com/BearStudio/cowat-v2/issues/252)) ([d28e198](https://github.com/BearStudio/cowat-v2/commit/d28e1986b06f5ef0cccd1bf2ebf18cabdf1fe132)), closes [#167](https://github.com/BearStudio/cowat-v2/issues/167)
* allow re-requesting a booking after cancel or refusal ([#248](https://github.com/BearStudio/cowat-v2/issues/248)) ([565a825](https://github.com/BearStudio/cowat-v2/commit/565a8250f4441716a7a13e028fce52a152061fed))
* animate tab indicator and disable stop links in templates ([#256](https://github.com/BearStudio/cowat-v2/issues/256)) ([dd25870](https://github.com/BearStudio/cowat-v2/commit/dd25870609b7381f983f7fbbf42c3191ee127852))
* **ci:** only run PR title check on open and edit events ([#277](https://github.com/BearStudio/cowat-v2/issues/277)) ([7065208](https://github.com/BearStudio/cowat-v2/commit/7065208585c26cefe4f319770aded8a09e7b5975))
* focus and scroll to input when adding a stop ([#249](https://github.com/BearStudio/cowat-v2/issues/249)) ([9487951](https://github.com/BearStudio/cowat-v2/commit/9487951930db43fb8e1b97ffeb5ce9cbf748f3fe)), closes [#153](https://github.com/BearStudio/cowat-v2/issues/153)
* improve database seeds with fewer users and correct timings ([#268](https://github.com/BearStudio/cowat-v2/issues/268)) ([4614954](https://github.com/BearStudio/cowat-v2/commit/46149544085331deb2a6dc9d4258cb6be17c2874))
* increase active tab indicator opacity in dark mode ([#267](https://github.com/BearStudio/cowat-v2/issues/267)) ([f9bd393](https://github.com/BearStudio/cowat-v2/commit/f9bd3938ffa1701148c5c00f09d484c48c31e28b))
* notify passengers when commute is modified ([#250](https://github.com/BearStudio/cowat-v2/issues/250)) ([767b721](https://github.com/BearStudio/cowat-v2/commit/767b7217047dfa8f9d7e62d75792adabad42dd2a))
* preserve bookings on commute edit, cancel on seat reduction ([#254](https://github.com/BearStudio/cowat-v2/issues/254)) ([35c0fa2](https://github.com/BearStudio/cowat-v2/commit/35c0fa261b1cc0fdd31dd9f3bea6ed7676258c7a))
* serialize array search params as JSON in routeUrl ([#261](https://github.com/BearStudio/cowat-v2/issues/261)) ([ba429cd](https://github.com/BearStudio/cowat-v2/commit/ba429cd96983437b919013d2d6d9a29ac0b56b4c)), closes [#242](https://github.com/BearStudio/cowat-v2/issues/242)
* update e2e tests and enable CI workflow ([#235](https://github.com/BearStudio/cowat-v2/issues/235)) ([cd52487](https://github.com/BearStudio/cowat-v2/commit/cd524871e9b5ee94204ad3ae5815d40dfa75b0d5)), closes [#234](https://github.com/BearStudio/cowat-v2/issues/234)
* update pr-title workflow content ([c6c7b4f](https://github.com/BearStudio/cowat-v2/commit/c6c7b4f681b0483bb7bff3453431bf872d0c0e18))


### Features

* **account:** improve avatar and name editing UX ([#263](https://github.com/BearStudio/cowat-v2/issues/263)) ([28f0aa0](https://github.com/BearStudio/cowat-v2/commit/28f0aa03aaa8f10a2d6221556343062a5dec4f7f))
* better loading states with layout-matching skeletons ([#246](https://github.com/BearStudio/cowat-v2/issues/246)) ([f30c031](https://github.com/BearStudio/cowat-v2/commit/f30c0312570d2304a4aa8f5b2579ee501ebaa491)), closes [#240](https://github.com/BearStudio/cowat-v2/issues/240)
* **commute:** show template picker below details step ([#278](https://github.com/BearStudio/cowat-v2/issues/278)) ([cf83630](https://github.com/BearStudio/cowat-v2/commit/cf83630ecc16b34427b59347368d155177a90845))
* improve request cards UX and commute request redirect ([#266](https://github.com/BearStudio/cowat-v2/issues/266)) ([d0aff63](https://github.com/BearStudio/cowat-v2/commit/d0aff6389a05285db54b142aba62462bc80bbe50))
* improve template picker and account pages UX ([#262](https://github.com/BearStudio/cowat-v2/issues/262)) ([22c6e5c](https://github.com/BearStudio/cowat-v2/commit/22c6e5c0d4a0481a963f28bb539c22200c353c9c))
* include commute requests in navbar badge count ([#245](https://github.com/BearStudio/cowat-v2/issues/245)) ([7ac7cdc](https://github.com/BearStudio/cowat-v2/commit/7ac7cdc65e79f38c9a8ef8df4e47f4a3bee6190f)), closes [#243](https://github.com/BearStudio/cowat-v2/issues/243)
* move step navigation to top with progress bar and quick create banner ([#264](https://github.com/BearStudio/cowat-v2/issues/264)) ([c6b1324](https://github.com/BearStudio/cowat-v2/commit/c6b13244e7c3af5e56e7203809d5dbec865f7b89))
* prefetch query data in route loaders ([#255](https://github.com/BearStudio/cowat-v2/issues/255)) ([78b429a](https://github.com/BearStudio/cowat-v2/commit/78b429aeec130462fa5b0a6bd223d3642ea9397a))
* redesign location cards with map preview and streamlined actions ([#265](https://github.com/BearStudio/cowat-v2/issues/265)) ([6dac57c](https://github.com/BearStudio/cowat-v2/commit/6dac57c5333a4a090c8934787df42baa62ddfbdb))
* simplify commute creation flow and remove speed dials ([#260](https://github.com/BearStudio/cowat-v2/issues/260)) ([b72bfbe](https://github.com/BearStudio/cowat-v2/commit/b72bfbe5d51e0012b7322ad85c4402ad44d8f0fd))
* UI polish pass — font, colors, dashboard, timeline, empty states ([#247](https://github.com/BearStudio/cowat-v2/issues/247)) ([e41a5e7](https://github.com/BearStudio/cowat-v2/commit/e41a5e7ab2488328faa24d51767a9389bda92d4f))

# [1.1.0](https://github.com/BearStudio/cowat-v2/compare/v1.0.2...v1.1.0) (2026-03-25)


### Bug Fixes

* apply shadcn preset theme and UI polish ([#224](https://github.com/BearStudio/cowat-v2/issues/224)) ([c7461cb](https://github.com/BearStudio/cowat-v2/commit/c7461cb50d2d5e347c2e8cd851d21f8e0623d8b9))
* booking submit button not visible on mobile + round-trip seat overcounting ([#195](https://github.com/BearStudio/cowat-v2/issues/195)) ([ee53df5](https://github.com/BearStudio/cowat-v2/commit/ee53df5203819090a504d96c8ddc3e9e022683c4)), closes [#147](https://github.com/BearStudio/cowat-v2/issues/147) [#148](https://github.com/BearStudio/cowat-v2/issues/148)
* **booking:** left-align booking type tag in request card ([#199](https://github.com/BearStudio/cowat-v2/issues/199)) ([e9ccb9d](https://github.com/BearStudio/cowat-v2/commit/e9ccb9d70a1a6f3b9cd8091a59169c50e06e70cf)), closes [#166](https://github.com/BearStudio/cowat-v2/issues/166)
* cancel modal layout and stop timeline redesign ([#212](https://github.com/BearStudio/cowat-v2/issues/212)) ([aced899](https://github.com/BearStudio/cowat-v2/commit/aced89956de61f10cafe3a9dd92f0f0ff93ec7b0)), closes [#211](https://github.com/BearStudio/cowat-v2/issues/211)
* move date validation to Zod refine ([#232](https://github.com/BearStudio/cowat-v2/issues/232)) ([cfbf984](https://github.com/BearStudio/cowat-v2/commit/cfbf984d55886123642188ea46019def559a6c09))
* prevent driver from booking seats on their own commute ([#142](https://github.com/BearStudio/cowat-v2/issues/142)) ([7973db5](https://github.com/BearStudio/cowat-v2/commit/7973db5ec4124d88171c5d9bdb78af9f71c2e39a))
* prevent driver from opening booking drawer for own commute ([#141](https://github.com/BearStudio/cowat-v2/issues/141)) ([73f51f0](https://github.com/BearStudio/cowat-v2/commit/73f51f042e0daaa862776e1f4602feb1893160b9))
* redirect to /commutes after creating a commute ([#230](https://github.com/BearStudio/cowat-v2/issues/230)) ([9b81dc8](https://github.com/BearStudio/cowat-v2/commit/9b81dc83d428275a657be2fd06ee07e99cf54b0e))
* show item name and feature icon in deletion confirmation dialogs ([#206](https://github.com/BearStudio/cowat-v2/issues/206)) ([00d887b](https://github.com/BearStudio/cowat-v2/commit/00d887b79d1b7d77169c273448a4c76ceb3b26fc)), closes [#163](https://github.com/BearStudio/cowat-v2/issues/163) [#164](https://github.com/BearStudio/cowat-v2/issues/164)
* small UI/UX issues ([#165](https://github.com/BearStudio/cowat-v2/issues/165), [#168](https://github.com/BearStudio/cowat-v2/issues/168), [#172](https://github.com/BearStudio/cowat-v2/issues/172)) ([#222](https://github.com/BearStudio/cowat-v2/issues/222)) ([e72b195](https://github.com/BearStudio/cowat-v2/commit/e72b195154584b5e58c3bae3725aea25f652c166))
* sort imports in nav-sidebar ([#193](https://github.com/BearStudio/cowat-v2/issues/193)) ([c120555](https://github.com/BearStudio/cowat-v2/commit/c120555b5e33dc2e386525bcec1637d563c8113a))


### Features

* add daily carpool reminder cron notification ([#229](https://github.com/BearStudio/cowat-v2/issues/229)) ([120fdbf](https://github.com/BearStudio/cowat-v2/commit/120fdbf2e8643d682f609e1aa7b46bcf0315db79))
* add hit-area utilities and apply to buttons for mobile tap targets ([#203](https://github.com/BearStudio/cowat-v2/issues/203)) ([bba8417](https://github.com/BearStudio/cowat-v2/commit/bba84179fd70943e67cb8fc1c3ea203b43fdb0d4))
* add location address to stops timeline ([#233](https://github.com/BearStudio/cowat-v2/issues/233)) ([81310ac](https://github.com/BearStudio/cowat-v2/commit/81310aca5408ff28e0f23053de28049a241dacdf))
* add phone number format validation ([#204](https://github.com/BearStudio/cowat-v2/issues/204)) ([2e9e7fb](https://github.com/BearStudio/cowat-v2/commit/2e9e7fb45946bdade9368de45d9ffb49b8661a68))
* add QR code in terminal on dev server start ([#145](https://github.com/BearStudio/cowat-v2/issues/145)) ([b5c37d6](https://github.com/BearStudio/cowat-v2/commit/b5c37d643d432c5dea333257b7371d0b74669c6a))
* add view transitions with directional slide animations ([#197](https://github.com/BearStudio/cowat-v2/issues/197)) ([c6dbb9c](https://github.com/BearStudio/cowat-v2/commit/c6dbb9c78221e4c216963d48b94491d4346b94c4))
* animate speed dial open/close with stagger and exit transitions ([#198](https://github.com/BearStudio/cowat-v2/issues/198)) ([518d227](https://github.com/BearStudio/cowat-v2/commit/518d227b1c542ff319a26059fa8b7ab92c399a39))
* apply start-ui-web upstream changes (2026-03-02 → 2026-03-19) ([#192](https://github.com/BearStudio/cowat-v2/issues/192)) ([a0b2eeb](https://github.com/BearStudio/cowat-v2/commit/a0b2eeb0a86401ae13aa4924ab7961b10416d948)), closes [better-auth#2398](https://github.com/better-auth/issues/2398)
* commute request page and dashboard CTA ([#231](https://github.com/BearStudio/cowat-v2/issues/231)) ([d9375cb](https://github.com/BearStudio/cowat-v2/commit/d9375cb9801dc605baa9fb6d3d63dbb746150498))
* commute request system with My Requests tabs ([#228](https://github.com/BearStudio/cowat-v2/issues/228)) ([3d73bf1](https://github.com/BearStudio/cowat-v2/commit/3d73bf1ff590e5d570e8ea712539f10cb00c70c0))
* **devtools:** add owner login hint + fix speed dial label ([#200](https://github.com/BearStudio/cowat-v2/issues/200)) ([7db8d17](https://github.com/BearStudio/cowat-v2/commit/7db8d179d3802a73ef742a5ce9432d06d282996a))
* **e2e:** manager organization — view details and update settings ([#138](https://github.com/BearStudio/cowat-v2/issues/138)) ([a00ec64](https://github.com/BearStudio/cowat-v2/commit/a00ec64e1d7ebcedfbe95308af8949ff685bd23a))
* Firebase Cloud Messaging — web push notifications ([#210](https://github.com/BearStudio/cowat-v2/issues/210)) ([188fe72](https://github.com/BearStudio/cowat-v2/commit/188fe7207edde11d3f78e07d18ec264b01efa59d))
* multi-email invite with user search ([#234](https://github.com/BearStudio/cowat-v2/issues/234)) ([a136983](https://github.com/BearStudio/cowat-v2/commit/a13698373b7e6192c4a7125ce8188c87c0372480))
* redesign auth layout with carpooling-themed panel ([#146](https://github.com/BearStudio/cowat-v2/issues/146)) ([c36317a](https://github.com/BearStudio/cowat-v2/commit/c36317a89587968c6afe8ae481ed7438696ffeff))
* redesign commute and booking cards ([#202](https://github.com/BearStudio/cowat-v2/issues/202)) ([fb6c576](https://github.com/BearStudio/cowat-v2/commit/fb6c576074f590215bc2a4d8d20dbc0a874bb5ac))
* show auth image on mobile login ([#226](https://github.com/BearStudio/cowat-v2/issues/226)) ([0133131](https://github.com/BearStudio/cowat-v2/commit/013313114ffb90f2ae3b4b44c61e528d206d0a75))
* typesafe route URLs in notification templates ([#221](https://github.com/BearStudio/cowat-v2/issues/221)) ([f4db262](https://github.com/BearStudio/cowat-v2/commit/f4db2627270636649ccecd4f79ed81161ea1a06a)), closes [#218](https://github.com/BearStudio/cowat-v2/issues/218) [#219](https://github.com/BearStudio/cowat-v2/issues/219) [#218](https://github.com/BearStudio/cowat-v2/issues/218) [#219](https://github.com/BearStudio/cowat-v2/issues/219)

## [1.0.2](https://github.com/BearStudio/cowat-v2/compare/v1.0.1...v1.0.2) (2026-02-25)


### Bug Fixes

* replace raw Slack mrkdwn syntax with jsx-slack components ([#116](https://github.com/BearStudio/cowat-v2/issues/116)) ([50794ed](https://github.com/BearStudio/cowat-v2/commit/50794ed1b503012d081e3453cb5288537d60b805))

## [1.0.1](https://github.com/BearStudio/cowat-v2/compare/v1.0.0...v1.0.1) (2026-02-25)


### Bug Fixes

* pass baseUrl to commute.created Slack broadcast blocks ([d384da6](https://github.com/BearStudio/cowat-v2/commit/d384da6183bb2f5c9f276453ea5985189be821bb))

# 1.0.0 (2026-02-25)


### Bug Fixes

* address low-complexity issues [#95](https://github.com/BearStudio/cowat-v2/issues/95), [#99](https://github.com/BearStudio/cowat-v2/issues/99), [#104](https://github.com/BearStudio/cowat-v2/issues/104), [#105](https://github.com/BearStudio/cowat-v2/issues/105) ([#107](https://github.com/BearStudio/cowat-v2/issues/107)) ([f41c935](https://github.com/BearStudio/cowat-v2/commit/f41c935d5b2669d134859fe367784b5d290a1212))
* filter past-date requests and invalidate count on accept/refuse ([#33](https://github.com/BearStudio/cowat-v2/issues/33)) ([c26752d](https://github.com/BearStudio/cowat-v2/commit/c26752d70b3f6e4bf949478a58343e4009a15671))
* low-complexity UI improvements (batch 1) ([#106](https://github.com/BearStudio/cowat-v2/issues/106)) ([f55a2c9](https://github.com/BearStudio/cowat-v2/commit/f55a2c9fa41277a553293996a29a0a88f00453c7))
* normalize dates to noon UTC to prevent off-by-one ([#34](https://github.com/BearStudio/cowat-v2/issues/34)) ([b45bdd6](https://github.com/BearStudio/cowat-v2/commit/b45bdd6b009a95074f2127aad01e3e1bd0ed82ef))
* pin checkbox border radius to fixed 5px ([e9d6461](https://github.com/BearStudio/cowat-v2/commit/e9d6461317beffab1d4d2f73fde81e3d433fd5af))
* redirect admin to app root instead of /manager on login ([#85](https://github.com/BearStudio/cowat-v2/issues/85)) ([694ac40](https://github.com/BearStudio/cowat-v2/commit/694ac409b4666260a93f7723a9f5c2119feff66d)), closes [#80](https://github.com/BearStudio/cowat-v2/issues/80)
* replace TODO types with type-safe bridge pattern ([#76](https://github.com/BearStudio/cowat-v2/issues/76)) ([0fc779d](https://github.com/BearStudio/cowat-v2/commit/0fc779deb6a34a60e7d62b6b80936bad59c331c8))
* router unit tests ([#37](https://github.com/BearStudio/cowat-v2/issues/37)) ([b98ff1a](https://github.com/BearStudio/cowat-v2/commit/b98ff1a4746117ed1089e090452ffb02ce7c42c3))
* Swagger UI document could not be loaded ([#102](https://github.com/BearStudio/cowat-v2/issues/102)) ([#109](https://github.com/BearStudio/cowat-v2/issues/109)) ([f3fc13a](https://github.com/BearStudio/cowat-v2/commit/f3fc13a0c728b3761d0b132cc81df46df4eb1ed7))
* update nitro to latest nightly build ([#71](https://github.com/BearStudio/cowat-v2/issues/71)) ([fe358d5](https://github.com/BearStudio/cowat-v2/commit/fe358d5239a19f6f8a5bbdd37e9e44f1e7c0e8a3))


### Features

* account page with phone and auto-accept ([#18](https://github.com/BearStudio/cowat-v2/issues/18)) ([4dd622f](https://github.com/BearStudio/cowat-v2/commit/4dd622f0cb284bfdffc3662ecf7944db07e80aee))
* add carpooling domain models, location & commute features ([#3](https://github.com/BearStudio/cowat-v2/issues/3)) ([bd70dd6](https://github.com/BearStudio/cowat-v2/commit/bd70dd6e0b34459723514f9eb9634c0012fc45d5))
* add claude skills ([1292f16](https://github.com/BearStudio/cowat-v2/commit/1292f16ff9f742aca3cc4d5da23d7320238cdcff))
* add commute summary with driver info to booking and stop cancel drawers ([#110](https://github.com/BearStudio/cowat-v2/issues/110)) ([2eec2e8](https://github.com/BearStudio/cowat-v2/commit/2eec2e8a7260a902a19906143d5639955bd49081))
* add date range filters to stats dashboard ([#90](https://github.com/BearStudio/cowat-v2/issues/90)) ([4c185ee](https://github.com/BearStudio/cowat-v2/commit/4c185ee478d5fc90cee06b529eb8886248cdec8c)), closes [#79](https://github.com/BearStudio/cowat-v2/issues/79)
* add Dev Actions devtools panel ([#5](https://github.com/BearStudio/cowat-v2/issues/5)) ([cd4269d](https://github.com/BearStudio/cowat-v2/commit/cd4269d62781f9972e55e0b5ccbda0b0387e6948))
* add favicon ([#66](https://github.com/BearStudio/cowat-v2/issues/66)) ([ac2d74a](https://github.com/BearStudio/cowat-v2/commit/ac2d74a8b67a04e497bda396893a3ac280ebd943))
* add multi-tenant organization support ([#35](https://github.com/BearStudio/cowat-v2/issues/35)) ([86db364](https://github.com/BearStudio/cowat-v2/commit/86db3647e35766fa8a43eb1835b8b3787c1ebf9b))
* add organization slug to app and manager URLs ([#38](https://github.com/BearStudio/cowat-v2/issues/38)) ([0a9366e](https://github.com/BearStudio/cowat-v2/commit/0a9366ed7d22b77d969a6cf245a01eac2e34030d))
* add Prisma satisfies annotations to router variables ([#32](https://github.com/BearStudio/cowat-v2/issues/32)) ([b92377d](https://github.com/BearStudio/cowat-v2/commit/b92377d909a9cb83673b11c2f0a54b87e6e2bddf))
* add required field indicators ([#48](https://github.com/BearStudio/cowat-v2/issues/48)) ([a99ea57](https://github.com/BearStudio/cowat-v2/commit/a99ea57988bc7aeacf7908eee68b8b1ca881c360))
* add reusable MultiStepForm component ([#73](https://github.com/BearStudio/cowat-v2/issues/73)) ([6257f5e](https://github.com/BearStudio/cowat-v2/commit/6257f5e92f9b6191073008a89842534728946fed))
* add ride request card component ([#15](https://github.com/BearStudio/cowat-v2/issues/15)) ([f6addff](https://github.com/BearStudio/cowat-v2/commit/f6addff3d6fda32ee86a5d012bdd5f5e2a5108f1)), closes [#10](https://github.com/BearStudio/cowat-v2/issues/10)
* add semantic release workflow and user seed script ([#112](https://github.com/BearStudio/cowat-v2/issues/112)) ([bb1258b](https://github.com/BearStudio/cowat-v2/commit/bb1258be5b1cd8c67a54a2746d0a3f24d7fa8459))
* admin stats page with user rankings ([#29](https://github.com/BearStudio/cowat-v2/issues/29)) ([2eb96ed](https://github.com/BearStudio/cowat-v2/commit/2eb96ed2510df362eaaa858fa6e6a98f78af24fb))
* auto-accept booking for autoAccept drivers ([#16](https://github.com/BearStudio/cowat-v2/issues/16)) ([8ec3b15](https://github.com/BearStudio/cowat-v2/commit/8ec3b15094e8187b0bbae308024411f82377edb2)), closes [#7](https://github.com/BearStudio/cowat-v2/issues/7)
* auto-compute inward times & commute form improvements ([#58](https://github.com/BearStudio/cowat-v2/issues/58)) ([d853bf2](https://github.com/BearStudio/cowat-v2/commit/d853bf2600e2a4c2563a213b6eb09b9fb9ea4531))
* auto-fill org slug from name ([#45](https://github.com/BearStudio/cowat-v2/issues/45)) ([0439606](https://github.com/BearStudio/cowat-v2/commit/0439606407bdd12059ea2517239cb393c2d7fffb))
* blue brand theme with reduced border radius ([#50](https://github.com/BearStudio/cowat-v2/issues/50)) ([28a8735](https://github.com/BearStudio/cowat-v2/commit/28a8735ac2ebea1704e4cf0e65931491477d3978))
* booking router, dashboard, location & commute CRUD ([#4](https://github.com/BearStudio/cowat-v2/issues/4)) ([94f7080](https://github.com/BearStudio/cowat-v2/commit/94f7080e23221f086c126326153d73d0b40c9e1a))
* booking status colors, commute card redesign & shared actions ([#52](https://github.com/BearStudio/cowat-v2/issues/52)) ([a59b88b](https://github.com/BearStudio/cowat-v2/commit/a59b88b81f35692756712a35e331072b21bfb420))
* carpooling domain models, user extensions, and location CRUD ([#1](https://github.com/BearStudio/cowat-v2/issues/1)) ([60b3a44](https://github.com/BearStudio/cowat-v2/commit/60b3a44ae6af88b3ae52d58cb96d20a80d613456))
* centralize date formats with typed feature-scoped keys ([#53](https://github.com/BearStudio/cowat-v2/issues/53)) ([4187e53](https://github.com/BearStudio/cowat-v2/commit/4187e53ab324baab8f75621f948d176d3107417d))
* centralize feature icons config ([#54](https://github.com/BearStudio/cowat-v2/issues/54)) ([223a0c4](https://github.com/BearStudio/cowat-v2/commit/223a0c4ef8ba5cd899b272c58022a9f160ee463e))
* clean boilerplate code ([a7db9fd](https://github.com/BearStudio/cowat-v2/commit/a7db9fd897a5fe53369d28675960e81b79a16ca8))
* clickable empty commute & active commute view ([#68](https://github.com/BearStudio/cowat-v2/issues/68)) ([bdbfef2](https://github.com/BearStudio/cowat-v2/commit/bdbfef24d48095e9627609f26df04bdd698aeaf8))
* commute card badges row & departure times ([#63](https://github.com/BearStudio/cowat-v2/issues/63)) ([09771d7](https://github.com/BearStudio/cowat-v2/commit/09771d77ec36f05274bed63993713e4ab0f19df4))
* commute date validation and future-only filtering ([#30](https://github.com/BearStudio/cowat-v2/issues/30)) ([c074414](https://github.com/BearStudio/cowat-v2/commit/c074414a9c7ac177549275a65c84d7ac28765a66))
* Commute MultiStepform ([#70](https://github.com/BearStudio/cowat-v2/issues/70)) ([e0b4c7a](https://github.com/BearStudio/cowat-v2/commit/e0b4c7a84f2cc30b984fc3f7e2957e5d5bdd0f55))
* CommuteTemplate CRUD with shared form fields ([#26](https://github.com/BearStudio/cowat-v2/issues/26)) ([dc5de85](https://github.com/BearStudio/cowat-v2/commit/dc5de85d445719aed1fd20e67f9e5ad625a821b7))
* configure Slack integration at org level ([#92](https://github.com/BearStudio/cowat-v2/issues/92)) ([30da359](https://github.com/BearStudio/cowat-v2/commit/30da35973682779d10b4fa9bf134c4834778a716))
* date search param for commute creation ([#28](https://github.com/BearStudio/cowat-v2/issues/28)) ([a4b60ec](https://github.com/BearStudio/cowat-v2/commit/a4b60ecca9fdcf6fcce38181d3ef7602f9245da7))
* dayjs.f() plugin for feature-scoped date formatting ([#72](https://github.com/BearStudio/cowat-v2/issues/72)) ([4a11009](https://github.com/BearStudio/cowat-v2/commit/4a11009f57c6e76ffa10a4c8d0d3f2c54bfd949c))
* delete organization & remove member ([#56](https://github.com/BearStudio/cowat-v2/issues/56)) ([4ea6988](https://github.com/BearStudio/cowat-v2/commit/4ea698883b242afcc2c2a8329085ce50474209aa))
* disable booking when commute is full ([#62](https://github.com/BearStudio/cowat-v2/issues/62)) ([8e19234](https://github.com/BearStudio/cowat-v2/commit/8e192340b59742a37bea6d672fb721aa2fc40d6f))
* enforce booking status state machine ([#13](https://github.com/BearStudio/cowat-v2/issues/13)) ([85e3885](https://github.com/BearStudio/cowat-v2/commit/85e3885f6fc344e2858a93dcdbcb0114711f5673))
* filter booking trip type by commute type and stop position ([#60](https://github.com/BearStudio/cowat-v2/issues/60)) ([44e9e11](https://github.com/BearStudio/cowat-v2/commit/44e9e11985b0978a9ad2368c2dc8248b3ff8fa7e))
* implement edit commute ([#111](https://github.com/BearStudio/cowat-v2/issues/111)) ([01d3d70](https://github.com/BearStudio/cowat-v2/commit/01d3d707986922370a39abcab0d1c3dbe43fb87a))
* improve commute stops UI layout ([#51](https://github.com/BearStudio/cowat-v2/issues/51)) ([81d12a7](https://github.com/BearStudio/cowat-v2/commit/81d12a76b36ad32cebdfe6d3e1dd138ed646924f))
* improve empty states ([#65](https://github.com/BearStudio/cowat-v2/issues/65)) ([72300fb](https://github.com/BearStudio/cowat-v2/commit/72300fbc4066c7c284894b6e17e6d36396837375))
* improve Slack message templates ([#91](https://github.com/BearStudio/cowat-v2/issues/91)) ([4640dfa](https://github.com/BearStudio/cowat-v2/commit/4640dfa6b1f40a0f364f5a51edf10c41f9960990))
* improve Slack notifications and extract slack client ([#77](https://github.com/BearStudio/cowat-v2/issues/77)) ([4649464](https://github.com/BearStudio/cowat-v2/commit/4649464320474629f41a334ced33b62855ae1124))
* increase touch targets and border radius for mobile UX ([552b02f](https://github.com/BearStudio/cowat-v2/commit/552b02f05aafd4585b0b03ab1d60548e63dd37e3))
* initial commit ([66f19cb](https://github.com/BearStudio/cowat-v2/commit/66f19cbc4c91c2daf123324a9a9d367d2edb3603))
* location create/update in drawer ([#43](https://github.com/BearStudio/cowat-v2/issues/43)) ([ec4e0d0](https://github.com/BearStudio/cowat-v2/commit/ec4e0d063b0b67155b40fdbca1a0e1244185a9eb))
* Logo ([#64](https://github.com/BearStudio/cowat-v2/issues/64)) ([3986aa3](https://github.com/BearStudio/cowat-v2/commit/3986aa32460018341f3f0b4d888cfcfcfc4fa39e))
* migrate Slack templates to jsx-slack with devtools preview ([#108](https://github.com/BearStudio/cowat-v2/issues/108)) ([29bedfb](https://github.com/BearStudio/cowat-v2/commit/29bedfbf90671310dcd517f9faabb30d1a55d0c5))
* org-role-based access control for manager routes ([#40](https://github.com/BearStudio/cowat-v2/issues/40)) ([4dbc661](https://github.com/BearStudio/cowat-v2/commit/4dbc661b1a45a913348c016ddcf4bd1385e6d0f8))
* overhaul Slack notification templates ([#113](https://github.com/BearStudio/cowat-v2/issues/113)) ([16e3d4d](https://github.com/BearStudio/cowat-v2/commit/16e3d4da6c27326c9b63e0a608c4c5e95e5fd764))
* pluggable notification system ([#25](https://github.com/BearStudio/cowat-v2/issues/25)) ([78abb8e](https://github.com/BearStudio/cowat-v2/commit/78abb8efe19bda7a97ac95133c214be20188321b))
* redesign commute stops as timeline with passenger badges ([#59](https://github.com/BearStudio/cowat-v2/issues/59)) ([2bfd2f9](https://github.com/BearStudio/cowat-v2/commit/2bfd2f9b6e7f75d6a6cca3c581260c06a6da9f59))
* remove active commute view ([#93](https://github.com/BearStudio/cowat-v2/issues/93)) ([a9f2955](https://github.com/BearStudio/cowat-v2/commit/a9f295560b2d65a4504194f4c7b795ad562057fb))
* rename inward/outward to inbound/outbound ([#57](https://github.com/BearStudio/cowat-v2/issues/57)) ([ba6337a](https://github.com/BearStudio/cowat-v2/commit/ba6337a3572420fc8a54713db835b6b96c2000a5))
* replace Inter with Public Sans font ([#55](https://github.com/BearStudio/cowat-v2/issues/55)) ([15db16d](https://github.com/BearStudio/cowat-v2/commit/15db16dc70472141f5b11c9eaa3a89433b88d5e1))
* requests page with paginated ride request list ([#17](https://github.com/BearStudio/cowat-v2/issues/17)) ([1d6486b](https://github.com/BearStudio/cowat-v2/commit/1d6486b936536bc86e2adab290644433fcd14d58)), closes [#15](https://github.com/BearStudio/cowat-v2/issues/15) [#9](https://github.com/BearStudio/cowat-v2/issues/9)
* require org name confirmation when deleting organization ([#87](https://github.com/BearStudio/cowat-v2/issues/87)) ([460facc](https://github.com/BearStudio/cowat-v2/commit/460facc602a5bee4e49e173512e3f049b544476e)), closes [#78](https://github.com/BearStudio/cowat-v2/issues/78)
* responsive floating action buttons & speed dial ([#67](https://github.com/BearStudio/cowat-v2/issues/67)) ([10dc43d](https://github.com/BearStudio/cowat-v2/commit/10dc43d4e23c2daad6fc7db4cbc96a61526c29ea))
* ride request navigation and pending count badge ([#14](https://github.com/BearStudio/cowat-v2/issues/14)) ([46b0ec9](https://github.com/BearStudio/cowat-v2/commit/46b0ec942cafdaf3d2a06a363f738cf3cf60ece4))
* separate user and org scoped settings on account pages ([#41](https://github.com/BearStudio/cowat-v2/issues/41)) ([605e376](https://github.com/BearStudio/cowat-v2/commit/605e376cab71efa36be84e1e348770baefcf7935))
* shadcn Empty component for empty states ([#24](https://github.com/BearStudio/cowat-v2/issues/24)) ([45c90e9](https://github.com/BearStudio/cowat-v2/commit/45c90e93eb5f6d7e4d25d6e45e3a8e34bbbcc6fa))
* Slack notification channel ([#31](https://github.com/BearStudio/cowat-v2/issues/31)) ([1b2e997](https://github.com/BearStudio/cowat-v2/commit/1b2e9976f6f98c5a8af0471234e951b582c907ed))
* surface Locations & Templates from My Commutes ([#49](https://github.com/BearStudio/cowat-v2/issues/49)) ([9af52d5](https://github.com/BearStudio/cowat-v2/commit/9af52d5e606239b6d33638d4cf4eec2dc306bc92))
* template picker in commute creation flow ([#27](https://github.com/BearStudio/cowat-v2/issues/27)) ([cc21a25](https://github.com/BearStudio/cowat-v2/commit/cc21a251fbed88f89a7d0d93ec9ab10a51c79f7a))
* use Resend SMTP for emails in production ([#69](https://github.com/BearStudio/cowat-v2/issues/69)) ([ed714d2](https://github.com/BearStudio/cowat-v2/commit/ed714d23b89392c57bed9dd8b7d63c0e7e27cfc9))
* use rich template card in create commute picker ([#61](https://github.com/BearStudio/cowat-v2/issues/61)) ([568abff](https://github.com/BearStudio/cowat-v2/commit/568abff399ec65a0f2a763a3cbc8ccf37342fccb))
