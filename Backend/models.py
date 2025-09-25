from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv


load_dotenv()  # Load environment variables from .env file


model = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)

parser = StrOutputParser()

