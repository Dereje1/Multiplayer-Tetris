const {
  setAuthRoutes, getProfile, logOut,
} = require('../../authentication/routes');

describe('Authentication routes', () => {
  let req; let
    res;
  beforeEach(() => {
    req = {
      user: {
        google: {
          id: 'abc',
          username: 'test username',
          displayName: 'test display name',
        },
      },
      logout: jest.fn(),
    };
    res = {
      json: jest.fn(),
      redirect: jest.fn(),
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  test('will get the profile for a user', () => {
    getProfile(req, res);
    expect(res.json).toHaveBeenCalledWith({
      authenticated: true,
      userIp: expect.any(String),
      username: 'abc',
      userId: 'abc',
      displayname: 'test display name',
      service: 'google',
    });
  });

  test('will log a user out', () => {
    logOut(req, res);
    expect(req.logout).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/');
  });
});

describe('The app will', () => {
  let app; let
    passport;
  beforeEach(() => {
    app = {
      get: jest.fn(),
    };
    passport = {
      authenticate: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  test('set the auth routes', () => {
    setAuthRoutes(app, passport);
    const allowedRoutes = app.get.mock.calls.map(r => r[0]);
    expect(allowedRoutes).toEqual([
      '/auth/profile',
      '/auth/logout',
      '/auth/google',
      '/auth/google/redirect',
    ]);
    expect(passport.authenticate).toHaveBeenCalledTimes(2);
    expect(passport.authenticate.mock.calls[0]).toEqual(['google', { scope: ['profile', 'email'] }]);
    expect(passport.authenticate.mock.calls[1]).toEqual(['google', {
      successRedirect: '/',
      failureRedirect: '/',
    }]);
  });
});
