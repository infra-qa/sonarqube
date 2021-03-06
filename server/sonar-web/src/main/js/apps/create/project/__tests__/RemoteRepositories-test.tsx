/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import { shallow } from 'enzyme';
import RemoteRepositories from '../RemoteRepositories';
import { getRepositories } from '../../../../api/alm-integration';
import { waitAndUpdate } from '../../../../helpers/testUtils';

jest.mock('../../../../api/alm-integration', () => ({
  getRepositories: jest.fn().mockResolvedValue({
    repositories: [
      {
        label: 'Cool Project',
        installationKey: 'github/cool',
        linkedProjectKey: 'proj_cool',
        linkedProjectName: 'Proj Cool'
      },
      { label: 'Awesome Project', installationKey: 'github/awesome' }
    ]
  })
}));

const almApplication = {
  backgroundColor: 'blue',
  iconPath: 'icon/path',
  installationUrl: 'https://alm.installation.url',
  key: 'github',
  name: 'GitHub'
};

const organization: T.Organization = {
  alm: { key: 'github', url: '' },
  key: 'sonarsource',
  name: 'SonarSource',
  subscription: 'FREE'
};

beforeEach(() => {
  (getRepositories as jest.Mock<any>).mockClear();
});

it('should display the list of repositories', async () => {
  const wrapper = shallowRender();
  expect(wrapper).toMatchSnapshot();
  await waitAndUpdate(wrapper);
  expect(wrapper).toMatchSnapshot();
  expect(getRepositories).toHaveBeenCalledWith({ organization: 'sonarsource' });
});

it('should display the organization upgrade box', async () => {
  (getRepositories as jest.Mock<any>).mockResolvedValueOnce({
    repositories: [{ label: 'Foo Project', installationKey: 'github/foo', private: true }]
  });
  const wrapper = shallowRender({ organization: { ...organization, actions: { admin: true } } });
  await waitAndUpdate(wrapper);
  expect(wrapper.find('UpgradeOrganizationBox')).toMatchSnapshot();
  wrapper.find('UpgradeOrganizationBox').prop<Function>('onOrganizationUpgrade')();
  expect(wrapper.find('Alert[variant="success"]').exists()).toBe(true);
});

it('should not display the organization upgrade box', () => {
  (getRepositories as jest.Mock<any>).mockResolvedValueOnce({
    repositories: [{ label: 'Bar Project', installationKey: 'github/bar', private: true }]
  });
  const wrapper = shallowRender({
    organization: {
      actions: { admin: true },
      alm: { key: 'github', url: '' },
      key: 'foobar',
      name: 'FooBar',
      subscription: 'PAID'
    }
  });

  expect(wrapper.find('UpgradeOrganizationBox').exists()).toBe(false);
});

function shallowRender(props: Partial<RemoteRepositories['props']> = {}) {
  return shallow(
    <RemoteRepositories
      almApplication={almApplication}
      onOrganizationUpgrade={jest.fn()}
      onProjectCreate={jest.fn()}
      organization={organization}
      {...props}
    />
  );
}
