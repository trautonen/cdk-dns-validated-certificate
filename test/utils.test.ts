import { orderBySignificance } from '../src/utils'

test('domains are ordered by significance', () => {
  const domains = ['test.example.com', 'example.com', 'a.b.example.com']

  const ordered = orderBySignificance(domains)

  expect(ordered[0]).toBe('a.b.example.com')
  expect(ordered[1]).toBe('test.example.com')
  expect(ordered[2]).toBe('example.com')
})
