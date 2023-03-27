/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const { _ } = require('lodash');
const app = require('../../../index');
const User = require('../../models/user.model');
const Article = require('../../models/article.model');
const Claim = require('../../models/claim.model');
const Review = require('../../models/review.model');

describe('Review API', async () => {
  let userAccessToken;
  let user;
  let article;
  let claim;
  let review1;
  let review2;

  before(async () => {
    await Review.deleteMany({});
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
    };

    article = {
      _id: '41224d776a326fb40f000002',
      addedBy: user._id,
      title: 'Lorem Ipsum title',
      text: 'Lorem Ipsum is simply dummg industry. Lorem Ipsum has been the industry',
      sourceUrl: 'https://www.lipsum.com/',
      sourceType: 'article',
      language: 'en',
    };

    claim = {
      addedBy: user._id,
      articleId: article._id,
      _id: '41224d776a326fb40f000003',
      text: 'Prvy claim hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
    };

    review1 = {
      vote: 'positive',
      links: [
        'https://trello.com/b/h9RX9y5p/factcheck',
        'https://moodle.fel.cvut.cz/?redirect=0',
        'https://www.youtube.com/watch?v=hyNVtwQrP20&list=RD',
      ],
      text: 'Prvy claim hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
    };

    review2 = {
      vote: 'negative',
      links: [
        'https://trello.com/b/h9RX9y5p/factcheck',
        'https://moodle.fel.cvut.cz/?redirect=0',
        'https://www.youtube.com/watch?v=hyNVtwQrP20&list=RD',
      ],
      text: 'Prvy claim hh nejaky nahodny text. Nema to ziadny zmysel, ale vsak to nie je podsatatne..',
    };

    await Claim.deleteMany({});
    await Article.deleteMany({});
    await User.deleteMany({});

    await User.create(user);
    userAccessToken = (await User.findAndGenerateToken(user)).accessToken;

    await Article.create(article);
    await Claim.create(claim);
  });

  describe('POST /v1/articles/:articleId/claims/:claimId/reviews', () => {
    it('should create a new review', async () => {
      return request(app)
        .post(`/v1/articles/${article._id}/claims/${claim._id}/reviews`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(review1)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body).to.have.a.property('_id');
          expect(res.body).to.have.a.property('createdAt');
          expect(res.body).to.have.a.property('links');
          expect(res.body.addedBy._id).to.be.equal(user._id);
          expect(res.body.text).to.be.equal(review1.text);
          expect(res.body.vote).to.be.equal(review1.vote);
          expect(res.body.nBeenVoted).to.be.equal(0);
        });
    });

    it('should report conflict when same user create second review for claim', () => {
      return request(app)
        .post(`/v1/articles/${article._id}/claims/${claim._id}/reviews`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(review2)
        .expect(httpStatus.CONFLICT);
    });

    it('should report error when text is not provided', () => {
      return request(app)
        .post(`/v1/articles/${article._id}/claims/${claim._id}/reviews`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(_.omit(review2, ['text']))
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
        .post(`/v1/articles/${article._id}/claims/${claim._id}/reviews`)
        .set('Authorization', 'Bearer ')
        .send(_.omit(review2, ['language']))
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/articles/:articleId/claims/:claimId/reviews', async () => {
    it('should list reviews for claim', () => {
      return request(app)
        .get(`/v1/articles/${article._id}/claims/${claim._id}/reviews`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(1);

          expect(res.body[0]).to.have.a.property('_id');
          expect(res.body[0]).to.have.a.property('text');
          expect(res.body[0]).to.have.a.property('addedBy');
          expect(res.body[0]).to.have.a.property('vote');
          expect(res.body[0]).to.have.a.property('links');

          expect(res.body[0].addedBy).to.have.a.property('firstName');
          expect(res.body[0].addedBy).to.have.a.property('lastName');
          expect(res.body[0].addedBy).to.have.a.property('email');
          expect(res.body[0].addedBy).to.have.a.property('_id');
          expect(res.body[0].nBeenVoted).to.be.equal(0);
        });
    });
  });

  describe('GET /v1/articles/:articleId/claims/:claimId/reviews/:reviewId', async () => {
    const xReviews = await Review.find();

    it('should get selecte reviews for selected claim', () => {
      return request(app)
        .get(`/v1/articles/${article._id}/claims/${claim._id}/reviews/${xReviews[0]._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          expect(res.body).to.be.an('object');

          expect(res.body).to.have.a.property('_id');
          expect(res.body).to.have.a.property('text');
          expect(res.body).to.have.a.property('addedBy');
          expect(res.body).to.have.a.property('vote');
          expect(res.body).to.have.a.property('links');

          expect(res.body.addedBy).to.have.a.property('firstName');
          expect(res.body.addedBy).to.have.a.property('lastName');
          expect(res.body.addedBy).to.have.a.property('email');
          expect(res.body.addedBy).to.have.a.property('_id');
          expect(res.body.nBeenVoted).to.be.equal(0);
        });
    });
  });
});
