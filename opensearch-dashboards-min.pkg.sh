VERSION="2.17.0"
NAME="opensearch-dashboards-min"

SOURCES=(
    "https://artifacts.opensearch.org/releases/core/opensearch-dashboards/${VERSION}/opensearch-dashboards-min-${VERSION}-linux-x64.tar.gz"
)

function prepare_root() {
    echo "opensearch-dashboards-2.17.0-linux-x64"
}

function analyze() {
    exec_bun ./src/cli/cli.js  -e http://go.dmo-test1.intra.matrixflowsapp.com:9200 &
    sleep 5s
    browser_navigate http://localhost:5601/app/dev_tools#/console
}

# All=5995 Files=4415 Read=4339 StatOnly=1656 TotalSize=22.58 MB
# All=5612 Files=4407 Read=4327 StatOnly=1285 TotalSize=19.66 MB
