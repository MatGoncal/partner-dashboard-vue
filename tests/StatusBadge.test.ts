import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import StatusBadge from '@/components/StatusBadge.vue';

describe('StatusBadge', () => {
  it('renders payment status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'PAID' } });
    expect(wrapper.text()).toContain('PAID');
    expect(wrapper.find('.badge--paid').exists()).toBe(true);
  });
});
