import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import Header from '../../components/common/Header';
import NavBar from '../../components/common/NavBar';
import IconSearch from '../../assets/Icon-Search.png';
import * as S from './style';
import getPost from '../../hooks/getPost';
import PostList from '../../components/post/PostList';
import SelectBox from '../../components/post/PostList/SelectBox';

const categoryContentsAll = [
  {
    Theme: '음료',
    categories: ['전체', '커피', '논커피', '주스', '기타'],
  },
  {
    Theme: '디저트',
    categories: ['전체'],
  },
];

function Post() {
  const options = ['최신순', '별점순', '방문순'];

  const [selectedOption, setSelectedOption] = useState('최신순');
  const [postList, setPostList] = useState([]);
  const [btnStyle, setBtnStyle] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const ThemeTitle = location.state;

  const categoryContents = categoryContentsAll.filter((v) => v.Theme === ThemeTitle)[0];

  const initialSet = useCallback(() => {
    try {
      console.log('마운트시 상태', selectedOption);
      setBtnStyle('전체');
      getPost('theme', ThemeTitle).then((data) => {
        const postData = data;
        const sortedByRecent = [...postData].sort(
          (a, b) => b.createAt.toDate() - a.createAt.toDate(),
        );

        setPostList(sortedByRecent);
      });
    } catch (error) {
      console.error('initialSet 함수에서 에러 발생');
      // 리다이렉트
      history.push('/home');
    }
  }, [selectedOption, ThemeTitle]);

  useEffect(() => {
    initialSet();
  }, []);

  useEffect(() => {
    handleSelectedOption(selectedOption);
  }, [postList, selectedOption]);

  const onClickCategory = (categoryName) => {
    setBtnStyle(categoryName);

    if (categoryName === '전체') {
      getPost('theme', ThemeTitle).then((data) => {
        const sortedBySelectedOption = sortPostListBySelectedOption(data);

        setPostList(sortedBySelectedOption);
      });
    } else {
      getPost('category', categoryName).then((data) => {
        const sortedBySelectedOption = sortPostListBySelectedOption(data);

        setPostList(sortedBySelectedOption);
      });
    }

    // selectedOption에 따라 정렬된 게시글 리스트를 반환하는 함수
    const sortPostListBySelectedOption = (posts) => {
      if (selectedOption === '최신순') {
        return [...posts].sort((a, b) => b.createAt.toDate() - a.createAt.toDate());
      } else if (selectedOption === '별점순') {
        return [...posts].sort((a, b) => b.score - a.score);
      } else if (selectedOption === '방문순') {
        return [...posts].sort((a, b) => b.date.toDate() - a.date.toDate());
      } else {
        return posts;
      }
    };

    // 선택된 카테고리에 대한 게시글 리스트를 setPostList로 업데이트
    handleSelectedOption(selectedOption);
  };

  const handleSelectedOption = (option) => {
    if (option === selectedOption) {
      return;
    }

    if (option === '최신순') {
      console.log('최신순');
      const sortedPost = [...postList].sort((a, b) => b.createAt.toDate() - a.createAt.toDate());

      setPostList(sortedPost);
    } else if (option === '별점순') {
      console.log('별점순실행');
      const sortedPost = [...postList].sort((a, b) => b.score - a.score);

      setPostList(sortedPost);
    } else if (option === '방문순') {
      const sortedPost = [...postList].sort((a, b) => b.date.toDate() - a.date.toDate());

      setPostList(sortedPost);
    }

    setSelectedOption(option);
  };

  useEffect(() => {
    handleSelectedOption(selectedOption);
    console.log(postList);
  }, [selectedOption]);

  const handleOptionSelected = (option) => {
    handleSelectedOption(option);
    console.log(option);
  };

  return (
    <>
      <h1 className='ir'>{ThemeTitle} 게시글 페이지</h1>
      <Header
        title={ThemeTitle}
        rightChild={
          <S.HeaderBtn onClick={() => navigate('/search')}>
            <img src={IconSearch} alt='검색' />
          </S.HeaderBtn>
        }
      />
      <S.Container>
        <nav>
          <S.CategoryContainer>
            {categoryContents.categories.map((content) => (
              <li onClick={() => onClickCategory(`${content}`)} key={uuidv4()}>
                <S.CategoryBtn isActive={content === btnStyle}>{content}</S.CategoryBtn>
              </li>
            ))}
          </S.CategoryContainer>
        </nav>
        <SelectBox
          options={options}
          onOptionSelected={handleOptionSelected}
          selected={selectedOption}
        />
        <PostList postList={postList} />
      </S.Container>
      <NavBar />
    </>
  );
}

export default Post;
