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

describe('Article API', async () => {
  let userAccessToken;
  let user;
  let article1;
  let article2;

  before(async () => {
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

    article1 = {
      text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
      sourceUrl: 'https://www.lipsum.com/',
      sourceType: 'article',
      language: 'en',
    };

    article2 = {
      text: 'Druhy clanok hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
      sourceUrl: 'https://xyzabc.com',
      sourceType: 'article',
      language: 'cz',
    };

    await User.deleteMany({});

    await User.create(user);
    userAccessToken = (await User.findAndGenerateToken(user)).accessToken;
  });

  describe('POST /v1/articles', () => {
    it('should create a new article', () => {
      return request(app)
        .post('/v1/articles')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(article1)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body).to.have.a.property('_id');
          expect(res.body).to.have.a.property('createdAt');
          expect(res.body.addedBy._id).to.be.equal(user._id);
          expect(res.body.text).to.be.equal(article1.text);
          expect(res.body.sourceUrl).to.be.equal(article1.sourceUrl);
          expect(res.body.sourceType).to.be.equal(article1.sourceType);
          expect(res.body.language).to.be.equal(article1.language);
        });
    });

    it('should create a new article', () => {
      return request(app)
        .post('/v1/articles')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(article2)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body).to.have.a.property('_id');
          expect(res.body).to.have.a.property('createdAt');
          expect(res.body.addedBy._id).to.be.equal(user._id);
          expect(res.body.text).to.be.equal(article2.text);
          expect(res.body.sourceUrl).to.be.equal(article2.sourceUrl);
          expect(res.body.sourceType).to.be.equal(article2.sourceType);
          expect(res.body.language).to.be.equal(article2.language);
        });
    });
  });

  it('should report error when text is not provided', () => {
    return request(app)
      .post('/v1/articles')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send(_.omit(article2, ['text']))
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

  it('should report error when language is not provided', () => {
    return request(app)
      .post('/v1/articles')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send(_.omit(article2, ['language']))
      .expect(httpStatus.BAD_REQUEST)
      .then((res) => {
        const { field } = res.body.errors[0];
        const { location } = res.body.errors[0];
        const { messages } = res.body.errors[0];
        expect(field).to.be.equal('language');
        expect(location).to.be.equal('body');
        expect(messages).to.include('"language" is required');
      });
  });

  it('should report error when sourceType is not provided', () => {
    return request(app)
      .post('/v1/articles')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send(_.omit(article2, ['sourceType']))
      .expect(httpStatus.BAD_REQUEST)
      .then((res) => {
        const { field } = res.body.errors[0];
        const { location } = res.body.errors[0];
        const { messages } = res.body.errors[0];
        expect(field).to.be.equal('sourceType');
        expect(location).to.be.equal('body');
        expect(messages).to.include('"sourceType" is required');
      });
  });

  let article1Id;

  describe('GET /v1/articles', () => {
    it('should list articles', () => {
      return request(app)
        .get('/v1/articles')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const includesArticle1 = some(res.body, article1);
          const includesArticle2 = some(res.body, article2);
          article1Id = res.body[0]._id;

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(2);
          expect(includesArticle1).to.be.true;
          expect(includesArticle2).to.be.true;

          expect(res.body[0].addedBy).to.have.a.property('firstName');
          expect(res.body[0].addedBy).to.have.a.property('lastName');
          expect(res.body[0].addedBy).to.have.a.property('email');
          expect(res.body[0].addedBy).to.have.a.property('_id');
        });
    });
  });

  describe('GET /v1/articles/:articleId', () => {
    it('should get selected article', () => {
      return request(app)
        .get(`/v1/articles/${article1Id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          expect(res.body).to.be.an('object');

          expect(res.body.addedBy).to.have.a.property('firstName');
          expect(res.body.addedBy).to.have.a.property('lastName');
          expect(res.body.addedBy).to.have.a.property('email');
          expect(res.body.addedBy).to.have.a.property('_id');
        });
    });
  });
});
