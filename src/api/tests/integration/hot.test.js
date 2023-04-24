/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const { _ } = require('lodash');
const { some } = require('lodash');
const app = require('../../../index');
const User = require('../../models/user.model');
const Article = require('../../models/article.model');
const Claim = require('../../models/claim.model');
const Review = require('../../models/review.model');
const Vote = require('../../models/vote.model');

describe('HOT resources API', async () => {
  let user2AccessToken;
  let user1;
  let user2;
  let article1;
  let article2;
  let claim1;
  let claim2;

  before(async () => {
    await Vote.deleteMany({});
    await Review.deleteMany({});
    await Claim.deleteMany({});
    await Article.deleteMany({});
    await User.deleteMany({});
  });

  beforeEach(async () => {
    user1 = {
      _id: '41224d776a326fb40f000001',
      email: 'user1@gmail.com',
      password: '123456',
      firstName: 'Meno',
      lastName: 'Priezvisko',
      nBeenVoted: 5,
    };

    user2 = {
      _id: '41224d776a326fb40f000010',
      email: 'usertest@gmail.com',
      password: '123456',
      firstName: 'ddddd',
      lastName: 'Priezdvisko',
      nBeenVoted: 0,
    };

    article1 = {
      _id: '41224d776a326fb40f000002',
      addedBy: user1._id,
      title: 'Lorem Ipsum title',
      text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
      sourceUrl: 'https://www.lipsum.com/',
      sourceType: 'article',
      lang: 'en',
      nBeenVoted: 3,
      nSaved: 3,
    };

    article2 = {
      _id: '41224d776a326fb40f000003',
      addedBy: user1._id,
      title: 'Lorem Ipsum title',
      text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
      sourceUrl: 'https://www.lipsum.com/',
      sourceType: 'article',
      lang: 'en',
      nBeenVoted: 2,
      nSaved: 1,
    };

    claim1 = {
      addedBy: user1._id,
      articleId: article1._id,
      _id: '41224d776a326fb40f000008',
      nBeenVoted: 1,
      text: 'Prvy claim xt. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
    };

    claim2 = {
      addedBy: user1._id,
      articleId: article1._id,
      _id: '41224d776a326fb40f000009',
      nBeenVoted: 155,
      text: 'Druh  hny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
    };

    await Claim.deleteMany({});
    await Article.deleteMany({});
    await User.deleteMany({});

    await User.create(user1);
    await User.create(user2);
    user2AccessToken = (await User.findAndGenerateToken(user2)).accessToken;

    await Article.create(article1);
    await Article.create(article2);
    await Claim.create(claim1);
    await Claim.create(claim2);
  });

  describe('GET /v1/hot/claims', () => {
    it('should list hottest claims', () => {
      return request(app)
        .get('/v1/hot/claims?page=1&perPage=20')
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const includesClaim1 = some(res.body, _.omit(claim1, ['addedBy']));
          const includesClaim2 = some(res.body, _.omit(claim2, ['addedBy']));

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(2);
          expect(includesClaim1).to.be.true;
          expect(includesClaim2).to.be.true;
        });
    });
  });

  describe('GET /v1/hot/articles', () => {
    it('should list hottest articles', () => {
      return request(app)
        .get('/v1/hot/articles?page=1&perPage=20')
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const includesArticle1 = some(res.body, _.omit(article1, ['addedBy']));
          const includesArticle2 = some(res.body, _.omit(article2, ['addedBy']));

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(2);
          expect(includesArticle1).to.be.true;
          expect(includesArticle2).to.be.true;
          expect(res.body[0]).to.have.a.property('isSavedByUser');
        });
    });
  });

  describe('GET /v1/hot/users', () => {
    it('should list hottest users?page=1&perPage=20', () => {
      return request(app)
        .get('/v1/hot/users')
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const includesUser1 = some(res.body, _.omit(user1, ['_id', 'password']));
          const includesUser2 = some(res.body, _.omit(user2, ['_id', 'password']));

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(2);
          expect(includesUser1).to.be.true;
          expect(includesUser2).to.be.true;
        });
    });
  });
});
