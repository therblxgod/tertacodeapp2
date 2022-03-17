// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Clipboard from '@react-native-community/clipboard';
import React, {useCallback} from 'react';

import {Screens, SnackBar} from '@constants';
import {useServerUrl} from '@context/server';
import {t} from '@i18n';
import {dismissBottomSheet} from '@screens/navigation';
import {showSnackBar} from '@utils/snack_bar';

import BaseOption from '../base_option';

import type PostModel from '@typings/database/models/servers/post';

type Props = {
    teamName: string;
    post: PostModel;
    location: typeof Screens[keyof typeof Screens];
    postInputTop: number;
}

const {SNACK_BAR_TYPE} = SnackBar;

const CopyPermalinkOption = ({teamName, post, location, postInputTop}: Props) => {
    const serverUrl = useServerUrl();

    const handleCopyLink = useCallback(async () => {
        const permalink = `${serverUrl}/${teamName}/pl/${post.id}`;
        Clipboard.setString(permalink);
        await dismissBottomSheet(Screens.POST_OPTIONS);
        showSnackBar({barType: SNACK_BAR_TYPE.LINK_COPIED, location, postInputTop});
    }, [teamName, post.id]);

    return (
        <BaseOption
            i18nId={t('get_post_link_modal.title')}
            defaultMessage='Copy Link'
            onPress={handleCopyLink}
            iconName='link-variant'
            testID='post.options.copy.permalink'
        />
    );
};

export default CopyPermalinkOption;