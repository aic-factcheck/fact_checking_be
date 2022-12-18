// /* eslint-disable arrow-body-style */
// /* eslint-disable no-unused-expressions */
// const request = require('supertest');
// const httpStatus = require('http-status');
// const { expect } = require('chai');
// const { _ } = require('lodash');
// const { some } = require('lodash');
// const app = require('../../../index');
// const User = require('../../models/user.model');
// const Article = require('../../models/article.model');
// const Claim = require('../../models/claim.model');
// const Review = require('../../models/review.model');
// const Vote = require('../../models/vote.model');

// describe('Vote API', async () => {
//   let userAccessToken;
//   let user2AccessToken;
//   let user1;
//   let user2;
//   let article1;
//   let article2;
//   let claim1;
//   let claim2;
//   let positiveVote;

//   before(async () => {
//     await Vote.deleteMany({});
//     await Review.deleteMany({});
//     await Claim.deleteMany({});
//     await Article.deleteMany({});
//     await User.deleteMany({});
//   });

//   beforeEach(async () => {
//     positiveVote = {
//       rating: 1,
//     };

//     user1 = {
//       _id: '41224d776a326fb40f000001',
//       email: 'user1@gmail.com',
//       password: '123456',
//       name: 'Admin User',
//       firstName: 'Meno',
//       lastName: 'Priezvisko',
//     };

//     user2 = {
//       _id: '41224d776a326fb40f000010',
//       email: 'usertest@gmail.com',
//       password: '123456',
//       name: 'Xddd',
//       firstName: 'ddddd',
//       lastName: 'Priezdvisko',
//     };

//     article1 = {
//       _id: '41224d776a326fb40f000002',
//       addedBy: user1._id,
//       title: 'Lorem Ipsum title',
//       text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
//       sourceUrl: 'https://www.lipsum.com/',
//       sourceType: 'article',
//       language: 'en',
//     };

//     article2 = {
//       _id: '41224d776a326fb40f000003',
//       addedBy: user1._id,
//       title: 'Lorem Ipsum title',
//       text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
//       sourceUrl: 'https://www.lipsum.com/',
//       sourceType: 'article',
//       language: 'en',
//     };

//     claim1 = {
//       addedBy: user1._id,
//       articleId: article1._id,
//       _id: '41224d776a326fb40f000008',
//       text: 'Prvy claim xt. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
//     };

//     claim2 = {
//       addedBy: user1._id,
//       articleId: article1._id,
//       _id: '41224d776a326fb40f000009',
//       text: 'Druh  hny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
//     };

//     await Claim.deleteMany({});
//     await Article.deleteMany({});
//     await User.deleteMany({});

//     await User.create(user1);
//     userAccessToken = (await User.findAndGenerateToken(user1)).accessToken;
//     await User.create(user2);
//     user2AccessToken = (await User.findAndGenerateToken(user2)).accessToken;

//     await Article.create(article1);
//     await Article.create(article2);
//     await Claim.create(claim1);
//     await Claim.create(claim2);
//   });
// });
