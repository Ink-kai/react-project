module.exports = {
    publishers: [
        {
            name: '@electron-forge/publisher-github',
            platforms: ['darwin'],
            config: {
                repository: {
                    owner: 'github-user-name',
                    name: 'github-repo-name',
                },
                prerelease: false,
                draft: true,
            },
        },
    ],
}