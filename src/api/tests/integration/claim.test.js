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

describe('Claims API', async () => {
  let userAccessToken;
  let user;
  let article;
  let claim1;
  let claim2;

  before(async () => {
    await Claim.deleteMany({});
    await Article.deleteMany({});
    await User.deleteMany({});
  });

  beforeEach(async () => {
    user = {
      _id: '41224d776a326fb40f000001',
      email: 'user1@gmail.com',
      password: '123456',
      name: 'Admin User',
      firstName: 'Meno',
      lastName: 'Priezvisko',
      role: 'admin',
    };

    article = {
      _id: '41224d776a326fb40f000002',
      addedBy: user._id,
      text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
      sourceUrl: 'https://www.lipsum.com/',
      sourceType: 'article',
      language: 'en',
    };

    claim1 = {
      text: 'Prvy claim hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
    };

    claim2 = {
      text: 'ADdqwd qwqw56d 6dqw56qw  aasaaaa hh nejaky nahodny text. Lorem ipsum alebo take daco hmm..',
    };

    // articleId = '41224d776a326fb40f000002';
    await Claim.deleteMany({});
    await Article.deleteMany({});
    await User.deleteMany({});

    await User.create(user);
    userAccessToken = (await User.findAndGenerateToken(user)).accessToken;

    await Article.create(article);
  });

  describe('POST /v1/articles/:articleId/claims', () => {
    it('should create a new claim', () => {
      return request(app)
        .post(`/v1/articles/${article._id}/claims`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(claim1)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body).to.have.a.property('_id');
          expect(res.body).to.have.a.property('createdAt');
          expect(res.body.addedBy._id).to.be.equal(user._id);
          expect(res.body.text).to.be.equal(claim1.text);
          // expect(res.body.language).to.be.equal(claim1.language);
        });
    });

    it('should create a new claim', () => {
      return request(app)
        .post(`/v1/articles/${article._id}/claims`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(claim2)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body).to.have.a.property('_id');
          expect(res.body).to.have.a.property('createdAt');
          expect(res.body.addedBy._id).to.be.equal(user._id);
          expect(res.body.text).to.be.equal(claim2.text);
        });
    });
  });

  it('should report error when text is not provided', () => {
    return request(app)
      .post(`/v1/articles/${article._id}/claims`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send(_.omit(claim2, ['text']))
      .expect(httpStatus.BAD_REQUEST)
      .then((res) => {
        const { field } = res.body.errors[0];
        const { location } = res.body.errors[0];
        const { messages } = res.body.errors[0];
        expect(field).to.be.equal('text');
        expect(location).to.be.equal('body');
        expect(messages).to.include('"text" is required');
      });
  });

  it('should report error when user has no auth', () => {
    return request(app)
      .post(`/v1/articles/${article._id}/claims`)
      .set('Authorization', 'Bearer ')
      .send(_.omit(claim2, ['language']))
      .expect(httpStatus.UNAUTHORIZED);
  });

  describe('GET /v1/articles/:articleId/claims', async () => {
    const xArticles = await Article.find();

    it('should list claims for article', () => {
      return request(app)
        .get(`/v1/articles${xArticles[0]._id}/claims`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const includesClaim1 = some(res.body, article);
          const includesClaim2 = some(res.body, article);

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(2);
          expect(includesClaim1).to.be.true;
          expect(includesClaim2).to.be.true;

          expect(res.body[0]).to.have.a.property('_id');
          expect(res.body[0]).to.have.a.property('text');
          expect(res.body[0]).to.have.a.property('addedBy');

          expect(res.body[0].addedBy).to.have.a.property('firstName');
          expect(res.body[0].addedBy).to.have.a.property('lastName');
          expect(res.body[0].addedBy).to.have.a.property('email');
          expect(res.body[0].addedBy).to.have.a.property('_id');
        });
    });
  });

  describe('GET /v1/articles/:articleId/claims/:claimId', async () => {
    // const xArticles = await Article.find();
    const xClaims = await Claim.find();

    it('should get selected claim for article', () => {
      return request(app)
        .get(`/v1/articles${article._id}/claims/${xClaims[0]._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.a.property('text');
          expect(res.body).to.have.a.property('text');

          expect(res.body.addedBy).to.have.a.property('firstName');
          expect(res.body.addedBy).to.have.a.property('lastName');
          expect(res.body.addedBy).to.have.a.property('email');
          expect(res.body.addedBy).to.have.a.property('_id');
        });
    });
  });
});
