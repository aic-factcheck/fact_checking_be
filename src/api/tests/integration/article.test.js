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
  let user2AccessToken;
  let user;
  let user2;
  let article1;
  let article2;
  let article1Id;
  // let article2Id;

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
    };

    user2 = {
      _id: '41224d776a326fb40f000010',
      email: 'usertest@gmail.com',
      password: '123456',
      name: 'Xddd',
      firstName: 'ddddd',
      lastName: 'Priezdvisko',
    };

    article1 = {
      title: 'first title',
      text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
      sourceUrl: 'https://www.lipsum.com/',
      sourceType: 'article',
      lang: 'en',
    };

    article2 = {
      title: 'SECOND title',
      text: 'Druhy clanok hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
      sourceUrl: 'https://xyzabc.com',
      sourceType: 'article',
      lang: 'cz',
    };

    await User.deleteMany({});

    await User.create(user);
    userAccessToken = (await User.findAndGenerateToken(user)).accessToken;
    await User.create(user2);
    user2AccessToken = (await User.findAndGenerateToken(user2)).accessToken;
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
          expect(res.body.lang).to.be.equal(article1.lang);
          expect(res.body.nBeenVoted).to.be.equal(0);
          expect(res.body.nSaved).to.be.equal(0);
        });
    });

    it('should create a new article', () => {
      return request(app)
        .post('/v1/articles')
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send(article2)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body).to.have.a.property('_id');
          expect(res.body).to.have.a.property('createdAt');
          expect(res.body.addedBy._id).to.be.equal(user2._id);
          expect(res.body.text).to.be.equal(article2.text);
          expect(res.body.sourceUrl).to.be.equal(article2.sourceUrl);
          expect(res.body.sourceType).to.be.equal(article2.sourceType);
          expect(res.body.lang).to.be.equal(article2.lang);
          expect(res.body.nBeenVoted).to.be.equal(0);
          expect(res.body.nSaved).to.be.equal(0);
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

  it('should report error when lang is not provided', () => {
    return request(app)
      .post('/v1/articles')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send(_.omit(article2, ['lang']))
      .expect(httpStatus.BAD_REQUEST)
      .then((res) => {
        const { field } = res.body.errors[0];
        const { location } = res.body.errors[0];
        const { messages } = res.body.errors[0];
        expect(field).to.be.equal('lang');
        expect(location).to.be.equal('body');
        expect(messages).to.include('"lang" is required');
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

  describe('GET /v1/articles', () => {
    it('should list articles', () => {
      return request(app)
        .get('/v1/articles')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const includesArticle1 = some(res.body, article1);
          const includesArticle2 = some(res.body, article2);
          article1Id = res.body[1]._id;
          // article2Id = res.body[1]._id;

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(2);
          expect(includesArticle1).to.be.true;
          expect(includesArticle2).to.be.true;

          expect(res.body[0].nBeenVoted).to.be.equal(0);

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
          expect(res.body).to.have.a.property('title');
          expect(res.body).to.have.a.property('claims');
          expect(res.body).to.have.a.property('sourceUrl');
          expect(res.body).to.have.a.property('sourceType');
          expect(res.body).to.have.a.property('lang');
          expect(res.body).to.have.a.property('isSavedByUser');
          expect(res.body.nBeenVoted).to.be.equal(0);

          expect(res.body.addedBy).to.have.a.property('firstName');
          expect(res.body.addedBy).to.have.a.property('lastName');
          expect(res.body.addedBy).to.have.a.property('email');
          expect(res.body.addedBy).to.have.a.property('_id');
          expect(res.body.addedBy).not.to.have.a.property('password');
        });
    });
  });

  describe('PUT /v1/articles/:articleId', () => {
    it('should replace article', async () => {
      const updatedArticle = {
        text: 'This is an updated article',
        sourceUrl: 'https://www.update.com/',
        sourceType: 'article',
        lang: 'cz',
      };

      return request(app)
        .put(`/v1/articles/${article1Id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updatedArticle)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.include(updatedArticle);

          expect(res.body._id).to.be.equal(article1Id);
          expect(res.body.text).to.be.equal(updatedArticle.text);
          expect(res.body.title).to.not.have.property('title');
          expect(res.body.sourceUrl).to.be.equal(updatedArticle.sourceUrl);
          expect(res.body.sourceType).to.be.equal(updatedArticle.sourceType);
          expect(res.body.lang).to.be.equal(updatedArticle.lang);

          expect(res.body.addedBy._id).to.be.equal(user._id);
        });
    });

    it('should report error when text is not provided', async () => {
      const updatedArticle = {
        title: 'This is an updated article',
        sourceUrl: 'https://www.update.com/',
        sourceType: 'article',
        lang: 'cz',
      };

      return request(app)
        .put(`/v1/articles/${article1Id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updatedArticle)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field, location, messages } = res.body.errors[0];

          expect(field).to.be.equal('text');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"text" is required');
        });
    });

    it('should report error when sourceUrl is longer than 256', async () => {
      const updatedArticle = {
        text: 'This is an updated article',
        sourceUrl: 'https://www.update.com/asdbdadadsdasdbdadadsddadaasdbdadadsddadaasdbdadadsddadaasdbdadadsddadaasdbdadadsddadadadaasdbdadadsdasdbdadadsddadaasdbdadadsddadaasdbdadadsddadaasdbdadadsddadaasdbdadadsddadadadaasdbdadadsdasdbdadadsddadaasdbdadadsddadaasdbdadadsddadaasdbdadadsddadaasdbdadadsddadadada',
        sourceType: 'article',
        lang: 'cz',
      };

      return request(app)
        .put(`/v1/articles/${article1Id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updatedArticle)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field, location, messages } = res.body.errors[0];

          expect(field).to.be.equal('sourceUrl');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"sourceUrl" length must be less than or equal to 256 characters long');
        });
    });

    it('should report error "Article does not exist" when article does not exists', () => {
      return request(app)
        .put('/v1/articles/hhXddRandomSmth')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Article does not exist');
        });
    });

    it('should report error when logged user is not the owner of article', async () => {
      const updatedArticle = {
        text: 'This is an updated article',
        sourceUrl: 'https://www.update.com/',
        sourceType: 'article',
        lang: 'cz',
      };

      return request(app)
        .put(`/v1/articles/${article1Id}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send(updatedArticle)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden to perform this action over selected resource.');
        });
    });
  });

  describe('PATCH /v1/articles/:articleId', () => {
    it('should update article', async () => {
      const text = 'new text field';
      const updatedArticle = {
        text: 'This is an updated article',
        sourceUrl: 'https://www.update.com/',
        sourceType: 'article',
        lang: 'cz',
      };

      return request(app)
        .patch(`/v1/articles/${article1Id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ text })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.text).to.be.equal(text);

          expect(res.body._id).to.be.equal(article1Id);
          expect(res.body.text).to.not.be.equal(updatedArticle.text);
          expect(res.body.sourceUrl).to.be.equal(updatedArticle.sourceUrl);
          expect(res.body.sourceType).to.be.equal(updatedArticle.sourceType);
          expect(res.body.lang).to.be.equal(updatedArticle.lang);
        });
    });

    it('should not update article when no parameters were given', async () => {
      const updatedArticle = {
        text: 'new text field',
        sourceUrl: 'https://www.update.com/',
        sourceType: 'article',
        lang: 'cz',
      };

      return request(app)
        .patch(`/v1/articles/${article1Id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send()
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.include(updatedArticle);
        });
    });

    it('should report error "Article does not exist" when article does not exists', () => {
      return request(app)
        .patch('/v1/articles/laspalmas')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Article does not exist');
        });
    });

    it('should report error when logged user is not the same as the owner', async () => {
      return request(app)
        .patch(`/v1/articles/${article1Id}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden to perform this action over selected resource.');
        });
    });
  });

  describe('DELETE /v1/articles', () => {
    it('should report error when logged user is not the same as the owner', async () => {
      return request(app)
        .delete(`/v1/articles/${article1Id}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden to perform this action over selected resource.');
        });
    });

    it('should delete article', async () => {
      return request(app)
        .delete(`/v1/articles/${article1Id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NO_CONTENT)
        .then(() => request(app).get('/v1/articles'))
        .then(async () => {
          const articles = await Article.find({});
          expect(articles).to.have.lengthOf(1);
        });
    });

    it('should report error "Article does not exist" when article does not exists', () => {
      return request(app)
        .delete('/v1/articles/laspalmas')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Article does not exist');
        });
    });
  });

  describe('GET /v1/users/:userId/articles', () => {
    it('should list articles of user', () => {
      return request(app)
        .get(`/v1/users/${user2._id}/articles`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const includesArticle2 = some(res.body, article2);

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(1);
          expect(includesArticle2).to.be.true;

          expect(res.body[0].addedBy._id).to.be.equal(user2._id);
        });
    });

    // it('should return forbidden for listing other users article', () => {
    //   return request(app)
    //     .get(`/v1/users/${user._id}/articles`)
    //     .set('Authorization', `Bearer ${user2AccessToken}`)
    //     .expect(httpStatus.FORBIDDEN);
    // });
  });
});
