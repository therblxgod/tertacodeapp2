// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {autocompleteChannels} from '@mm-redux/actions/channels';
import {autocompleteUsersInChannel} from '@mm-redux/actions/users';
import {COMMAND_SUGGESTION_CHANNEL, COMMAND_SUGGESTION_USER} from '@mm-redux/constants/apps';
import {Channel} from '@mm-redux/types/channels';

import type {DispatchFunc} from '@mm-redux/types/actions';
import type {UserAutocomplete} from '@mm-redux/types/apps';
import type {AutocompleteSuggestion} from '@mm-redux/types/integrations';
import type {GlobalState} from '@mm-redux/types/store';
import type {UserProfile} from '@mm-redux/types/users';

interface Store {
    dispatch: DispatchFunc;
    getState: () => GlobalState;
}

export async function inTextMentionSuggestions(pretext: string, store: Store, channelID: string, teamID: string, delimiter = ''): Promise<AutocompleteSuggestion[] | null> {
    const separatedWords = pretext.split(' ');
    const incompleteLessLastWord = separatedWords.slice(0, -1).join(' ');
    const lastWord = separatedWords[separatedWords.length - 1];
    if (lastWord.startsWith('@')) {
        const {data} = await store.dispatch(autocompleteUsersInChannel(lastWord.substring(1), channelID));
        const users = await getUserSuggestions(data);
        users.forEach((u) => {
            let complete = incompleteLessLastWord ? incompleteLessLastWord + ' ' + u.Complete : u.Complete;
            if (delimiter) {
                complete = delimiter + complete;
            }
            u.Complete = complete;
        });
        return users;
    }

    if (lastWord.startsWith('~') && !lastWord.startsWith('~~')) {
        const {data} = await store.dispatch(autocompleteChannels(teamID, lastWord.substring(1)));
        const channels = await getChannelSuggestions(data);
        channels.forEach((c) => {
            let complete = incompleteLessLastWord ? incompleteLessLastWord + ' ' + c.Complete : c.Complete;
            if (delimiter) {
                complete = delimiter + complete;
            }
            c.Complete = complete;
        });
        return channels;
    }

    return null;
}

export async function getUserSuggestions(usersAutocomplete?: UserAutocomplete): Promise<AutocompleteSuggestion[]> {
    const notFoundSuggestions = [{
        Complete: '',
        Suggestion: '',
        Description: 'No user found',
        Hint: '',
        IconData: '',
    }];
    if (!usersAutocomplete) {
        return notFoundSuggestions;
    }

    if (!usersAutocomplete.users.length && !usersAutocomplete.out_of_channel?.length) {
        return notFoundSuggestions;
    }

    const items: AutocompleteSuggestion[] = [];
    usersAutocomplete.users.forEach((u) => {
        items.push(getUserSuggestion(u));
    });
    usersAutocomplete.out_of_channel?.forEach((u) => {
        items.push(getUserSuggestion(u));
    });

    return items;
}

export async function getChannelSuggestions(channels?: Channel[]): Promise<AutocompleteSuggestion[]> {
    const notFoundSuggestion = [{
        Complete: '',
        Suggestion: '',
        Description: 'No channel found',
        Hint: '',
        IconData: '',
    }];
    if (!channels) {
        return notFoundSuggestion;
    }
    if (!channels.length) {
        return notFoundSuggestion;
    }

    const items = channels.map((c) => {
        return {
            Complete: '~' + c.name,
            Suggestion: '',
            Description: '',
            Hint: '',
            IconData: '',
            type: COMMAND_SUGGESTION_CHANNEL,
            item: c.id,
        };
    });

    return items;
}

function getUserSuggestion(u: UserProfile) {
    return {
        Complete: '@' + u.username,
        Suggestion: '',
        Description: '',
        Hint: '',
        IconData: '',
        type: COMMAND_SUGGESTION_USER,
        item: u.id,
    };
}
