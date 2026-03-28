
import './App.css'
import { Aside } from './components/aside'
import { Card } from './components/card'
import { Container } from './components/container'
import { Main } from './components/main'
import { SearchInput } from './components/searchInput'
import { Typography } from './components/typography'

function App() {
  

  return (
    <>
    <Container>
      <Aside/>
      <Main>
        <SearchInput/>
        <div>
          <Typography>
            Bem vindo
          </Typography>
        </div>
        <section>
          <Card>
            Helo
            <SearchInput/>
          </Card>
        </section>
      </Main>
    </Container>
    </>
  )
}

export default App
