import util from '../../socket/utility';

describe('The socket utility functions', () => {
  test('set users', () => {
    util.setUsers(['test user']);
    expect(util.userArr).toEqual(['test user']);
  });
});
