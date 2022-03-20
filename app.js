const { Client, Intents, MessageActionRow, MessageButton } = require('discord.js');
const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ] })

let rooms = [];

client.on('messageCreate', msg => {
    if (msg.content == '$OX 퀴즈 시작') {
        const userId = msg.author.id;
        rooms.push({ id: userId, participants: [], started : false, O : [], X : [] });
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(`enterGame>${userId}`)
                    .setLabel('게임 참가하기')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId(`startGame>${userId}`)
                    .setLabel('게임 시작하기')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId(`cancelGame>${userId}`)
                    .setLabel('취소')
                    .setStyle('DANGER'),
            );
        msg.reply({ content: '**아래의 버튼을 눌러 OX 퀴즈에 참여하세요!**', components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    const splitted = interaction.customId.split('>');
    if (splitted[0] == 'enterGame') {
        rooms.forEach(room => {
            if (room.id == splitted[1]) {
                if (room.started == true) {
                    interaction.reply('게임이 이미 시작됐어요!');
                } else {
                    if (!room.participants.includes(interaction.user.id)) {
                        room.participants.push(interaction.user.id);   
                        interaction.reply(`<@${interaction.user.id}>님이 참가했어요!`)
                    } else {
                        interaction.reply(`<@${interaction.user.id}>님은 이미 해당 게임에 참가했어요!`)
                    }
                }
            }
        });
    }
    if (splitted[0] == 'startGame') {
        const userId = interaction.user.id;
        rooms.forEach(room => {
            if (room.id == splitted[1]) {
                if (room.started == true) {
                    interaction.reply('게임이 이미 시작됐어요!');
                } else {
                    if (room.id == interaction.user.id) {
                        const row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                .setCustomId(`O>${room.id}>${new Date().getTime()}>${new Date().getTime() + 30000}`)
                                .setLabel('O')
                                .setStyle('PRIMARY'),
                            new MessageButton()
                                .setCustomId(`X>${room.id}>${new Date().getTime()}>${new Date().getTime() + 30000}`)
                                .setLabel('X')
                                .setStyle('DANGER'),
                            new MessageButton()
                                .setCustomId(`Next Round>${room.id}>${new Date().getTime()}>${new Date().getTime() + 30000}`)
                                .setLabel('다음 라운드')
                                .setStyle('PRIMARY'),
                        )
                        room.started = true;
                        interaction.reply({ content: '제한 시간은 30초입니다! 얼른 아래의 버튼을 누르세요!', components: [row] })
                    } else {
                        interaction.reply(`게임 생성자인 <@${room.id}>님만 게임을 시작할 수 있어요!`)
                    }
                }
            }
        })
    }
    if (splitted[0] == 'O' || splitted[0] == 'X') {
        if (new Date().getTime() > splitted[3]) {
            interaction.reply(`<@${interaction.user.id}> 제한 시간이 지났습니다!`);
        } else {
            rooms.forEach(room => {
                if (room.id == splitted[1]) {
                    if (room.participants.includes(interaction.user.id)) {
                        if (room.O.includes(interaction.user.id) || room.X.includes(interaction.user.id)) {
                            interaction.reply(`<@${interaction.user.id}>님은 이미 선택을 완료했습니다!`);
                        } else {
                            if (splitted[0] == 'O') {
                                room.O.push(interaction.user.id);
                            }
                            if (splitted[0] == 'X') {
                                room.X.push(interaction.user.id);
                            }
                            interaction.reply(`<@${interaction.user.id}>님이 선택을 완료했습니다!`);
                        }
                    } else {
                        interaction.reply(`<@${interaction.user.id}>님은 게임에 참여하지 않았습니다!`);
                    }
                }
            })
        }
    }
    if (splitted[0] == 'Next Round') {
        if (splitted[1] == interaction.user.id) {
            rooms.forEach(room => {
                console.log(room)
                if (room.id == splitted[1]) {
                    for (const p of room.participants){
                        if (!room.O.includes(p) && !room.X.includes(p)) {
                            room.participants = room.participants.filter(people => people != p);
                        }
                    }
                    let survivors = '';
                    if (room.participants < 3) {
                        for (const p of room.participants){
                            survivors += `<@${p}>, `;
                        }
                        interaction.reply(`**생존자 2명 이하가 되어 게임을 종료합니다!**\n생존자: ${survivors}`)
                            .then(() => {
                                rooms = rooms.filter(r => r != room);
                        })
                    }
                    const row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                .setCustomId(`O>${room.id}>${new Date().getTime()}>${new Date().getTime() + 30000}`)
                                .setLabel('O')
                                .setStyle('PRIMARY'),
                            new MessageButton()
                                .setCustomId(`X>${room.id}>${new Date().getTime()}>${new Date().getTime() + 30000}`)
                                .setLabel('X')
                                .setStyle('DANGER'),
                            new MessageButton()
                                .setCustomId(`Next Round>${room.id}>${new Date().getTime()}>${new Date().getTime() + 30000}`)
                                .setLabel('다음 라운드')
                                .setStyle('PRIMARY'),
                    )
                    if (room.O.length > room.X.length) {
                        room.participants = room.O;
                        for (const p of room.participants){
                            survivors += `<@${p}>, `;
                        }
                        interaction.reply({ content : `**O를 선택한 사람들만 생존했습니다! !**\n생존자: ${survivors}\n제한 시간은 30초입니다! 얼른 아래의 버튼을 누르세요!`, component : row});
                    }
                    if (room.O.length < room.X.length) {
                        room.participants = room.X;
                        for (const p of room.participants){
                            survivors += `<@${p}>, `;
                        }
                        interaction.reply({ content : `**X를 선택한 사람들만 생존했습니다! !**\n생존자: ${survivors}\n제한 시간은 30초입니다! 얼른 아래의 버튼을 누르세요!`, component : row});
                    }
                    if (room.O.length = room.X.length) {
                        for (const p of room.participants){
                            survivors += `<@${p}>, `;
                        }
                        interaction.reply({ content : `**동점입니다! 모두 생존했습니다! !**\n생존자: ${survivors}\n제한 시간은 30초입니다! 얼른 아래의 버튼을 누르세요!`, component : row});
                    }
                }
            })
        } else {
            interaction.reply(`게임 생성자인 <@${splitted[1]}>님만 다음 라운드로 넘어갈 수 있어요!`)
        }

    }
    console.log(interaction.user.id)
})


client.login(TOKEN);
