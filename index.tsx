/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { CopyIcon } from "@components/Icons";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import type { Channel, User } from "@vencord/discord-types";
import { GuildMemberStore, IconUtils, Menu, Toasts } from "@webpack/common";

interface UserContextProps {
    channel: Channel;
    guildId?: string;
    user: User;
}

function getAvatarUrl(user: User, guildId?: string): string {
    const memberAvatar = guildId ? GuildMemberStore.getMember(guildId, user.id)?.avatar : null;

    if (memberAvatar) {
        const url = IconUtils.getGuildMemberAvatarURLSimple({
            userId: user.id,
            avatar: memberAvatar,
            guildId: guildId!,
            canAnimate: true
        });
        return url.replace(/\?size=\d+/, "?size=4096");
    }

    const url = IconUtils.getUserAvatarURL(user, true);
    return url.replace(/\?size=\d+/, "?size=4096");
}

async function copyAvatar(url: string) {
    try {
        await navigator.clipboard.writeText(url);
        Toasts.show({
            message: "Avatar URL kopyalandı!",
            type: Toasts.Type.SUCCESS,
            id: Toasts.genId()
        });
    } catch (e) {
        Toasts.show({
            message: "Kopyalama başarısız!",
            type: Toasts.Type.FAILURE,
            id: Toasts.genId()
        });
    }
}

const UserContext: NavContextMenuPatchCallback = (children, { user, guildId }: UserContextProps) => {
    if (!user) return;

    const avatarUrl = getAvatarUrl(user, guildId);

    children.splice(-1, 0, (
        <Menu.MenuGroup>
            <Menu.MenuItem
                id="copy-avatar"
                label="Avatarı Kopyala"
                action={() => copyAvatar(avatarUrl)}
                icon={CopyIcon}
            />
        </Menu.MenuGroup>
    ));
};

export default definePlugin({
    name: "CopyAvatar",
    description: "Sağ tık menüsüne avatar URL'sini kopyalama seçeneği ekler",
    authors: [{ name: "verfired", id: 1362177941882142923n }],

    contextMenus: {
        "user-context": UserContext
    }
});
